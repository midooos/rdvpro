"""
RDVPro — Slots Routes
GET    /api/slots        — list slots (admin)
POST   /api/slots        — create a slot (admin)
PUT    /api/slots/:id    — update a slot (admin)
DELETE /api/slots/:id    — delete a slot (admin)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime

from models import db, Slot, Service
from middleware.auth_middleware import require_role

slots_bp = Blueprint("slots", __name__)


@slots_bp.get("")
@jwt_required()
@require_role("admin")
def list_slots():
    service_id = request.args.get("serviceId", type=int)
    date_str   = request.args.get("date")

    query = Slot.query
    if service_id:
        query = query.filter_by(service_id=service_id)
    if date_str:
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d").date()
            query = query.filter_by(date=d)
        except ValueError:
            pass

    slots = query.order_by(Slot.date, Slot.start_time).all()
    return jsonify({"slots": [s.to_dict() for s in slots]})


@slots_bp.post("")
@jwt_required()
@require_role("admin")
def create_slot():
    data = request.get_json() or {}
    service_id = data.get("serviceId")
    date_str   = data.get("date")
    start_str  = data.get("startTime")  # "09:00"
    end_str    = data.get("endTime")    # "09:30"

    if not all([service_id, date_str, start_str, end_str]):
        return jsonify({"message": "serviceId, date, startTime et endTime sont requis"}), 422

    Service.query.get_or_404(service_id)

    try:
        date       = datetime.strptime(date_str, "%Y-%m-%d").date()
        start_time = datetime.strptime(start_str, "%H:%M").time()
        end_time   = datetime.strptime(end_str,   "%H:%M").time()
    except ValueError:
        return jsonify({"message": "Format date/heure invalide"}), 422

    slot = Slot(service_id=service_id, date=date, start_time=start_time, end_time=end_time)
    db.session.add(slot)
    db.session.commit()
    return jsonify({"slot": slot.to_dict()}), 201


@slots_bp.put("/<int:slot_id>")
@jwt_required()
@require_role("admin")
def update_slot(slot_id):
    slot = Slot.query.get_or_404(slot_id)
    data = request.get_json() or {}

    if "startTime" in data:
        slot.start_time = datetime.strptime(data["startTime"], "%H:%M").time()
    if "endTime" in data:
        slot.end_time = datetime.strptime(data["endTime"], "%H:%M").time()
    if "isTaken" in data:
        slot.is_taken = data["isTaken"]

    db.session.commit()
    return jsonify({"slot": slot.to_dict()})


@slots_bp.delete("/<int:slot_id>")
@jwt_required()
@require_role("admin")
def delete_slot(slot_id):
    slot = Slot.query.get_or_404(slot_id)
    db.session.delete(slot)
    db.session.commit()
    return jsonify({"message": "Créneau supprimé"})
