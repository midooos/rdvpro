"""
RDVPro — Appointments Routes
GET    /api/appointments              — admin: all appointments
GET    /api/appointments/mine         — client: my appointments
GET    /api/appointments/available-slots
GET    /api/appointments/:id
POST   /api/appointments
PUT    /api/appointments/:id
PATCH  /api/appointments/:id/confirm
PATCH  /api/appointments/:id/cancel
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from models import db, Appointment, Slot, Service, User
from middleware.auth_middleware import require_role
from services.notification_service import NotificationService

appointments_bp = Blueprint("appointments", __name__)


@appointments_bp.get("")
@jwt_required()
@require_role("admin")
def list_appointments():
    page   = request.args.get("page", 1, type=int)
    limit  = request.args.get("limit", 20, type=int)
    status = request.args.get("status")

    query = Appointment.query
    if status:
        query = query.filter_by(status=status)

    paginated = query.order_by(Appointment.date.desc()).paginate(page=page, per_page=limit, error_out=False)
    return jsonify({
        "appointments": [a.to_dict() for a in paginated.items],
        "total":        paginated.total,
        "page":         page,
        "pages":        paginated.pages,
    })


@appointments_bp.get("/mine")
@jwt_required()
def my_appointments():
    user_id = int(get_jwt_identity())
    status  = request.args.get("status")

    query = Appointment.query.filter_by(client_id=user_id)
    if status:
        query = query.filter_by(status=status)

    appointments = query.order_by(Appointment.date.desc()).all()
    return jsonify({"appointments": [a.to_dict() for a in appointments]})


@appointments_bp.get("/available-slots")
@jwt_required()
def available_slots():
    service_id = request.args.get("serviceId", type=int)
    date_str   = request.args.get("date")

    if not service_id or not date_str:
        return jsonify({"message": "serviceId et date sont requis"}), 400

    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"message": "Format de date invalide (YYYY-MM-DD)"}), 400

    slots = Slot.query.filter_by(service_id=service_id, date=date, is_taken=False).all()
    return jsonify({"slots": [s.to_dict() for s in slots]})


@appointments_bp.get("/<int:appt_id>")
@jwt_required()
def get_appointment(appt_id):
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    appt    = Appointment.query.get_or_404(appt_id)

    # Clients can only see their own appointments
    if user.role != "admin" and appt.client_id != user_id:
        return jsonify({"message": "Accès refusé"}), 403

    return jsonify({"appointment": appt.to_dict()})


@appointments_bp.post("")
@jwt_required()
def create_appointment():
    user_id = int(get_jwt_identity())
    data    = request.get_json() or {}

    service_id = data.get("serviceId")
    date_str   = data.get("date")
    time_str   = data.get("time")
    note       = data.get("note", "")

    if not service_id or not date_str or not time_str:
        return jsonify({"message": "serviceId, date et time sont requis"}), 422

    service = Service.query.get_or_404(service_id)

    try:
        date_time = datetime.strptime(f"{date_str} {time_str.replace('h', ':')}", "%Y-%m-%d %H:%M")
    except ValueError:
        return jsonify({"message": "Format date/heure invalide"}), 422

    appt = Appointment(
        client_id=user_id,
        service_id=service_id,
        date=date_time,
        note=note,
        status="pending",
    )
    db.session.add(appt)
    db.session.commit()

    # Notify admins
    NotificationService.notify_admin_new_appointment(appt)

    return jsonify({"appointment": appt.to_dict()}), 201


@appointments_bp.put("/<int:appt_id>")
@jwt_required()
def update_appointment(appt_id):
    user_id = int(get_jwt_identity())
    appt    = Appointment.query.get_or_404(appt_id)
    user    = User.query.get(user_id)

    if user.role != "admin" and appt.client_id != user_id:
        return jsonify({"message": "Accès refusé"}), 403

    data = request.get_json() or {}
    if "note" in data:
        appt.note = data["note"]

    db.session.commit()
    return jsonify({"appointment": appt.to_dict()})


@appointments_bp.patch("/<int:appt_id>/confirm")
@jwt_required()
@require_role("admin")
def confirm_appointment(appt_id):
    appt = Appointment.query.get_or_404(appt_id)
    appt.status = "confirmed"
    db.session.commit()
    NotificationService.notify_appointment_confirmed(appt)
    return jsonify({"appointment": appt.to_dict()})


@appointments_bp.patch("/<int:appt_id>/cancel")
@jwt_required()
def cancel_appointment(appt_id):
    user_id = int(get_jwt_identity())
    appt    = Appointment.query.get_or_404(appt_id)
    user    = User.query.get(user_id)

    if user.role != "admin" and appt.client_id != user_id:
        return jsonify({"message": "Accès refusé"}), 403

    data   = request.get_json() or {}
    reason = data.get("reason", "")

    appt.status              = "cancelled"
    appt.cancellation_reason = reason

    # Free the slot if linked
    if appt.slot_id:
        slot = Slot.query.get(appt.slot_id)
        if slot:
            slot.is_taken = False

    db.session.commit()
    NotificationService.notify_appointment_cancelled(appt, reason)
    return jsonify({"appointment": appt.to_dict()})
