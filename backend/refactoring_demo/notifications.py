"""notifications.py
Refactored version eliminating bad smells:
- Replace magic numbers with named constants (THIRTY_MIN, ONE_DAY_MIN).
- Replace primitive dicts with dataclasses for clarity and type safety.
- Replace flag arguments with an explicit Channel enum.
- Extract formatting functions to remove duplication.
- Inject 'clock' via default (datetime.now) to reduce long parameter lists.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
from enum import Enum, auto
from typing import Callable, List, Dict

THIRTY_MIN = 30
ONE_DAY_MIN = 24 * 60

class Channel(Enum):
    EMAIL = auto()
    SMS = auto()

@dataclass(frozen=True)
class User:
    name: str
    email: str
    phone: str

@dataclass(frozen=True)
class Appointment:
    title: str
    when: datetime

@dataclass
class Message:
    channel: Channel
    to: str
    payload: Dict[str, str]

def _format_email(u: User, a: Appointment, mins: int) -> Message:
    if mins == THIRTY_MIN:
        subject = f"Reminder: {a.title} in {THIRTY_MIN} minutes"
    else:
        subject = f"Reminder: {a.title} tomorrow"
    body = (f"Hi {u.name},\n\nThis is a reminder that '{a.title}' is scheduled at {a.when}."
            f"\n\nThanks,\nDocMedaa")
    return Message(Channel.EMAIL, u.email, {"subject": subject, "body": body})

def _format_sms(u: User, a: Appointment, mins: int) -> Message:
    if mins == THIRTY_MIN:
        text = f"REMINDER: {a.title} in {THIRTY_MIN} min at {a.when}"
    else:
        text = f"REMINDER: {a.title} at {a.when}"
    return Message(Channel.SMS, u.phone, {"text": text})

FORMATTERS = {
    Channel.EMAIL: _format_email,
    Channel.SMS: _format_sms,
}

def should_remind(minutes_until: int) -> bool:
    return minutes_until in (THIRTY_MIN, ONE_DAY_MIN)

def plan_reminders(
    user: User,
    appt: Appointment,
    channels: List[Channel],
    *,               # enforce keyword-only for clarity
    clock: Callable[[], datetime] = datetime.now
) -> List[Message]:
    """Return reminder messages that should be sent now."""
    now = clock()
    mins = int((appt.when - now).total_seconds() // 60)
    if mins < -1:
        return []
    if not should_remind(mins):
        return []
    return [FORMATTERS[ch](user, appt, mins) for ch in channels]
