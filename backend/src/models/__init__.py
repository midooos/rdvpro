
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    first_name    = db.Column(db.String(80), nullable=False)
    last_name     = db.Column(db.String(80), nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    phone         = db.Column(db.String(30))
    role          = db.Column(db.String(20), nullable=False, default="client")  # admin | client
    is_active     = db.Column(db.Boolean, default=True, nullable=False)
    is_verified   = db.Column(db.Boolean, default=False, nullable=False)
    avatar_url    = db.Column(db.String(256))
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    appointments  = db.relationship("Appointment", foreign_keys="Appointment.client_id", backref="client", lazy="dynamic")
    notifications = db.relationship("Notification", backref="recipient", lazy="dynamic")

    def to_dict(self):
        return {
            "id":         self.id,
            "firstName":  self.first_name,
            "lastName":   self.last_name,
            "email":      self.email,
            "phone":      self.phone,
            "role":       self.role,
            "isActive":   self.is_active,
            "isVerified": self.is_verified,
            "avatarUrl":  self.avatar_url,
            "createdAt":  self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.email}>"


class Service(db.Model):
    __tablename__ = "services"

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    duration    = db.Column(db.Integer, nullable=False)  # minutes
    icon        = db.Column(db.String(10))
    color       = db.Column(db.String(20))
    is_active   = db.Column(db.Boolean, default=True)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    appointments = db.relationship("Appointment", backref="service", lazy="dynamic")
    slots        = db.relationship("Slot", backref="service", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "description": self.description,
            "duration": self.duration, "icon": self.icon, "color": self.color,
            "isActive": self.is_active,
        }


class Slot(db.Model):
    __tablename__ = "slots"

    id         = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    date       = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time   = db.Column(db.Time, nullable=False)
    is_taken   = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "serviceId": self.service_id,
            "date": self.date.isoformat(), "startTime": self.start_time.strftime("%H:%M"),
            "endTime": self.end_time.strftime("%H:%M"), "isTaken": self.is_taken,
        }


class Appointment(db.Model):
    __tablename__ = "appointments"

    id              = db.Column(db.Integer, primary_key=True)
    client_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    service_id      = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    slot_id         = db.Column(db.Integer, db.ForeignKey("slots.id"))
    date            = db.Column(db.DateTime, nullable=False)
    status          = db.Column(db.String(20), default="pending")
    # pending | confirmed | cancelled | completed | no_show
    note            = db.Column(db.Text)
    cancellation_reason = db.Column(db.Text)
    reminder_sent   = db.Column(db.Boolean, default=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at      = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "clientId":   self.client_id,
            "clientName": f"{self.client.first_name} {self.client.last_name}" if self.client else None,
            "serviceId":  self.service_id,
            "serviceName": self.service.name if self.service else None,
            "date":       self.date.isoformat(),
            "status":     self.status,
            "note":       self.note,
            "createdAt":  self.created_at.isoformat() if self.created_at else None,
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    type           = db.Column(db.String(60), nullable=False)
    title          = db.Column(db.String(200), nullable=False)
    message        = db.Column(db.Text, nullable=False)
    is_read        = db.Column(db.Boolean, default=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    appointment = db.relationship("Appointment", backref="notifications", foreign_keys=[appointment_id])

    def to_dict(self):
        return {
            "id":            self.id,
            "type":          self.type,
            "title":         self.title,
            "message":       self.message,
            "isRead":        self.is_read,
            "appointmentId": self.appointment_id,
            "recipientName": f"{self.recipient.first_name} {self.recipient.last_name}" if self.recipient else None,
            "createdAt":     self.created_at.isoformat() if self.created_at else None,
        }


class NotificationPreference(db.Model):
    __tablename__ = "notification_preferences"

    id                      = db.Column(db.Integer, primary_key=True)
    user_id                 = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    appointment_confirmed   = db.Column(db.Boolean, default=True, nullable=False)
    appointment_reminder_48 = db.Column(db.Boolean, default=True, nullable=False)
    appointment_cancelled   = db.Column(db.Boolean, default=True, nullable=False)
    appointment_updated     = db.Column(db.Boolean, default=True, nullable=False)
    marketing               = db.Column(db.Boolean, default=False, nullable=False)
    updated_at              = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("notification_preference", uselist=False))

    def to_dict(self):
        return {
            "appointmentConfirmed":   self.appointment_confirmed,
            "appointmentReminder48":  self.appointment_reminder_48,
            "appointmentCancelled":   self.appointment_cancelled,
            "appointmentUpdated":     self.appointment_updated,
            "marketing":              self.marketing,
        }



class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(256), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship("User", backref="reset_tokens")


class RefreshToken(db.Model):
    __tablename__ = "refresh_tokens"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    token      = db.Column(db.String(512), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    revoked    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="refresh_tokens")
