import os, sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from datetime import datetime, timedelta
from notifications import User, Appointment, Channel, plan_reminders, THIRTY_MIN, ONE_DAY_MIN
  

def mkdata():
    u = User(name='Ava', email='ava@example.com', phone='+15551234567')
    a = Appointment(title='Dental Checkup', when=datetime(2025,11,9,14,0,0))
    return u, a

def test_email_and_sms_30_min():
    u, a = mkdata()
    clock = lambda: a.when - timedelta(minutes=THIRTY_MIN)
    msgs = plan_reminders(u, a, [Channel.EMAIL, Channel.SMS], clock=clock)
    assert {m.channel for m in msgs} == {Channel.EMAIL, Channel.SMS}
    subj = next(m for m in msgs if m.channel is Channel.EMAIL).payload['subject']
    assert '30 minutes' in subj

def test_sms_tomorrow_text():
    u, a = mkdata()
    clock = lambda: a.when - timedelta(minutes=ONE_DAY_MIN)
    msgs = plan_reminders(u, a, [Channel.SMS], clock=clock)
    assert len(msgs) == 1 and msgs[0].channel is Channel.SMS
    assert 'REMINDER:' in msgs[0].payload['text']

def test_not_a_reminder_window_noop():
    u, a = mkdata()
    clock = lambda: a.when - timedelta(minutes=15)
    msgs = plan_reminders(u, a, [Channel.EMAIL, Channel.SMS], clock=clock)
    assert msgs == []

def test_no_reminder_past():
    u, a = mkdata()
    clock = lambda: a.when + timedelta(minutes=5)
    msgs = plan_reminders(u, a, [Channel.EMAIL, Channel.SMS], clock=clock)
    assert msgs == []

