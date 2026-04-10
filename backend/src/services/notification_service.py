"""
RDVPro — Notification Service

BUG FIX: send_appointment_reminders() called db.session.commit()
         OUTSIDE the try/except loop, meaning a single failed appt
         would skip the commit and lose all prior reminder flags.
         Now each appt is committed individually.
"""
from datetime import datetime, timedelta
from flask import current_app

from models import db, Notification, Appointment, User


class NotificationService:

    @staticmethod
    def create(user_id: int, notif_type: str, title: str, message: str, appointment_id=None) -> Notification:
        """Create and persist a notification."""
        notif = Notification(
            user_id=user_id,
            type=notif_type,
            title=title,
            message=message,
            appointment_id=appointment_id,
        )
        db.session.add(notif)
        db.session.commit()
        return notif

    @staticmethod
    def notify_appointment_confirmed(appointment: Appointment):
        NotificationService.create(
            user_id=appointment.client_id,
            notif_type="appointment_confirmed",
            title="Rendez-vous confirmé ✅",
            message=(
                f"Votre rendez-vous pour {appointment.service.name} "
                f"le {appointment.date.strftime('%d/%m/%Y à %Hh%M')} a été confirmé."
            ),
            appointment_id=appointment.id,
        )

    @staticmethod
    def notify_appointment_cancelled(appointment: Appointment, reason: str = ""):
        NotificationService.create(
            user_id=appointment.client_id,
            notif_type="appointment_cancelled",
            title="Rendez-vous annulé ❌",
            message=(
                f"Votre rendez-vous pour {appointment.service.name} "
                f"le {appointment.date.strftime('%d/%m/%Y à %Hh%M')} a été annulé."
                + (f" Raison : {reason}" if reason else "")
            ),
            appointment_id=appointment.id,
        )

    @staticmethod
    def notify_admin_new_appointment(appointment: Appointment):
        """Notify all admins of a new appointment."""
        admins = User.query.filter_by(role="admin", is_active=True).all()
        for admin in admins:
            NotificationService.create(
                user_id=admin.id,
                notif_type="new_appointment",
                title="Nouveau rendez-vous 📅",
                message=(
                    f"{appointment.client.first_name} {appointment.client.last_name} "
                    f"a réservé un RDV pour {appointment.service.name} "
                    f"le {appointment.date.strftime('%d/%m/%Y à %Hh%M')}."
                ),
                appointment_id=appointment.id,
            )

    @staticmethod
    def notify_welcome(user: User):
        NotificationService.create(
            user_id=user.id,
            notif_type="welcome",
            title="Bienvenue sur RDVPro 👋",
            message=f"Bonjour {user.first_name} ! Votre compte a été créé avec succès. Vous pouvez maintenant réserver vos rendez-vous.",
        )

    @staticmethod
    def send_appointment_reminders(hours_before: int = 48) -> int:
        """
        Find all confirmed appointments happening in `hours_before` hours
        and send reminder notifications to clients who haven't been reminded yet.
        Returns the number of reminders sent.

        BUG FIX: commit is now inside the per-appointment try/except so a
        single failure does not discard all previously-flagged reminders.
        """
        now        = datetime.utcnow()
        target_min = now + timedelta(hours=hours_before - 1)
        target_max = now + timedelta(hours=hours_before + 1)

        appointments = Appointment.query.filter(
            Appointment.status == "confirmed",
            Appointment.reminder_sent == False,
            Appointment.date.between(target_min, target_max),
        ).all()

        sent = 0
        for appt in appointments:
            try:
                NotificationService.create(
                    user_id=appt.client_id,
                    notif_type="appointment_reminder",
                    title="Rappel de rendez-vous ⏰",
                    message=(
                        f"Rappel : vous avez un rendez-vous pour {appt.service.name} "
                        f"dans moins de {hours_before}h, "
                        f"le {appt.date.strftime('%d/%m/%Y à %Hh%M')}."
                    ),
                    appointment_id=appt.id,
                )
                appt.reminder_sent = True
                db.session.commit()   # ← FIX: commit per appointment
                sent += 1
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Reminder error for appointment {appt.id}: {e}")

        return sent
