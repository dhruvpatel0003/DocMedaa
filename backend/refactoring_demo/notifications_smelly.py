"""notifications_smelly.py
Smelly version used for refactoring practice.

Bad smells demonstrated:
1) Long Parameter List & Flag Arguments (send_email, send_sms, tz, mode, now).
2) Duplicated Code / Magic Numbers (formatting duplicated for email & sms; 30 and 1440 appear inline).
3) Feature Envy / Primitive Obsession (user & appt are raw dicts instead of rich objects).
"""
from datetime import datetime, timedelta

def remind_user(
    user,              # dict -> {'name': str, 'email': str, 'phone': str}
    appt,              # dict -> {'title': str, 'when': datetime}
    now,               # datetime 'current' time (smell: should be injected clock or default)
    tz,                # str timezone like 'EST' (smell: not used properly)
    mode,              # str 'prod' or 'test' (smell: dead/unused logic)
    send_email,        # bool flag (smell)
    send_sms           # bool flag (smell)
):
    # DEAD / UNUSED: pretend to adjust timezone but ignore it (smell)
    if tz not in ('EST','PST','UTC','CST'):
        tz = 'UTC'
    # Flag-driven branching creates complex conditional (smell)
    messages = []

    # MAGIC NUMBERS: 30 minutes before and 1440 minutes (24h) before
    delta = appt['when'] - now
    mins = int(delta.total_seconds() // 60)

    # If appointment in past, do nothing (edge case coverage)
    if mins < -1:
        return messages

    # Duplicated formatting for email and sms (smell)
    if send_email and (mins == 30 or mins == 1440):
        subject = f"Reminder: {appt['title']} in {mins} minutes" if mins==30 else f"Reminder: {appt['title']} tomorrow"
        body = (
            f"Hi {user['name']},\n\nThis is a reminder that '{appt['title']}' is scheduled at {appt['when']}.\n\nThanks,\nDocMedaa"
        )
        messages.append({
            'channel': 'email',
            'to': user['email'],
            'subject': subject,
            'body': body
        })

    if send_sms and (mins == 30 or mins == 1440):
        text = f"REMINDER: {appt['title']} at {appt['when']}"
        if mins == 30:
            text = f"REMINDER: {appt['title']} in 30 min at {appt['when']}"
        messages.append({
            'channel': 'sms',
            'to': user['phone'],
            'text': text
        })

    # Mode branch that doesn't change behavior (smell)
    if mode == 'test':
        # Extra debug info left in production (smell)
        for m in messages:
            m['debug'] = True

    return messages
