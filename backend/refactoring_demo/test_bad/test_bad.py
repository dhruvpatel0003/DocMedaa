import os, sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

import re
from datetime import datetime, timedelta
from notifications_smelly import remind_user

def mkdata():
    user = {'name': 'Ava', 'email': 'ava@example.com', 'phone': '+15551234567'}
    appt_time = datetime(2025, 11, 9, 14, 0, 0)
    appt = {'title': 'Dental Checkup', 'when': appt_time}
    return user, appt

def test_email_30_min():
    user, appt = mkdata()
    now = appt['when'] - timedelta(minutes=30)
    msgs = remind_user(user, appt, now, tz='EST', mode='prod', send_email=True, send_sms=False)
    assert any(m['channel']=='email' for m in msgs)
    email = [m for m in msgs if m['channel']=='email'][0]
    assert '30 minutes' in email['subject'] or '30 min' in email.get('text','')

def test_sms_tomorrow():
    user, appt = mkdata()
    now = appt['when'] - timedelta(minutes=1440)
    msgs = remind_user(user, appt, now, tz='UTC', mode='prod', send_email=False, send_sms=True)
    assert any(m['channel']=='sms' for m in msgs)
    sms = [m for m in msgs if m['channel']=='sms'][0]
    assert 'REMINDER:' in sms['text']

def test_past_no_messages():
    user, appt = mkdata()
    now = appt['when'] + timedelta(minutes=5)
    msgs = remind_user(user, appt, now, tz='MYSTERY', mode='prod', send_email=True, send_sms=True)
    assert msgs == []
