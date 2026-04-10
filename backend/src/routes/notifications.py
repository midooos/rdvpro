"""
RDVPro — Notifications Routes
GET    /api/notifications             — list user's notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/mark-all-read
DELETE /api/notifications/:id
DELETE /api/notifications/read       — bulk delete read
POST   /api/notifications/send       — admin: send to specific user or all
POST   /api/notifications/send-reminders — admin: trigger 48h reminders
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, Notification, User, Appointment
from middleware.auth_middleware import require_role
from services.notification_service import NotificationService

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
@jwt_required()
def get_notifications():
    user_id  = int(get_jwt_identity())
    page     = request.args.get("page", 1, type=int)
    limit    = request.args.get("limit", 20, type=int)
    is_read  = request.args.get("isRead", None)

    query = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc())
    if is_read is not None:
        query = query.filter_by(is_read=is_read.lower() == "true")

    paginated = query.paginate(page=page, per_page=limit, error_out=False)

    return jsonify({
        "notifications": [n.to_dict() for n in paginated.items],
        "total":         paginated.total,
        "page":          page,
        "pages":         paginated.pages,
        "unreadCount":   Notification.query.filter_by(user_id=user_id, is_read=False).count(),
    })


@notifications_bp.get("/unread-count")
@jwt_required()
def unread_count():
    user_id = int(get_jwt_identity())
    count   = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({"count": count})


@notifications_bp.patch("/mark-all-read")
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "Toutes les notifications marquées comme lues"})


@notifications_bp.patch("/<int:notif_id>/read")
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif   = Notification.query.filter_by(id=notif_id, user_id=user_id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({"notification": notif.to_dict()})


@notifications_bp.delete("/read")
@jwt_required()
def delete_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=True).delete()
    db.session.commit()
    return jsonify({"message": "Notifications lues supprimées"})


@notifications_bp.delete("/<int:notif_id>")
@jwt_required()
def delete_notification(notif_id):
    user_id = int(get_jwt_identity())
    notif   = Notification.query.filter_by(id=notif_id, user_id=user_id).first_or_404()
    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification supprimée"}), 200


@notifications_bp.post("/send")
@jwt_required()
@require_role("admin")
def send_notification():
    data = request.get_json() or {}
    user_id        = data.get("userId")       # None → broadcast to all clients
    notif_type     = data.get("type", "system")
    title          = data.get("title")
    message        = data.get("message")
    appointment_id = data.get("appointmentId")

    if not title or not message:
        return jsonify({"message": "title et message sont obligatoires"}), 422

    if user_id:
        user = User.query.get_or_404(user_id)
        notif = NotificationService.create(user_id, notif_type, title, message, appointment_id)
        return jsonify({"notification": notif.to_dict()}), 201
    else:
        # Broadcast to all active clients
        clients = User.query.filter_by(role="client", is_active=True).all()
        sent = []
        for c in clients:
            n = NotificationService.create(c.id, notif_type, title, message, appointment_id)
            sent.append(n.to_dict())
        return jsonify({"sent": len(sent), "notifications": sent}), 201


@notifications_bp.post("/send-reminders")
@jwt_required()
@require_role("admin")
def send_reminders():
    data  = request.get_json() or {}
    hours = data.get("hoursBeforeAppointment", 48)
    result = NotificationService.send_appointment_reminders(hours)
    return jsonify({"message": "Rappels envoyés", "sent": result})


@notifications_bp.get("/preferences")
@jwt_required()
def get_preferences():
    user_id = int(get_jwt_identity())
    from models import NotificationPreference
    pref = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not pref:
        # Créer des préférences par défaut si elles n'existent pas
        pref = NotificationPreference(user_id=user_id)
        db.session.add(pref)
        db.session.commit()
    return jsonify({"preferences": pref.to_dict()})


@notifications_bp.put("/preferences")
@jwt_required()
def update_preferences():
    user_id = int(get_jwt_identity())
    from models import NotificationPreference
    data = request.get_json() or {}
    pref = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not pref:
        pref = NotificationPreference(user_id=user_id)
        db.session.add(pref)

    if "appointmentConfirmed"  in data: pref.appointment_confirmed   = data["appointmentConfirmed"]
    if "appointmentReminder48" in data: pref.appointment_reminder_48 = data["appointmentReminder48"]
    if "appointmentCancelled"  in data: pref.appointment_cancelled   = data["appointmentCancelled"]
    if "appointmentUpdated"    in data: pref.appointment_updated     = data["appointmentUpdated"]
    if "marketing"             in data: pref.marketing               = data["marketing"]

    db.session.commit()
    return jsonify({"preferences": pref.to_dict()})
