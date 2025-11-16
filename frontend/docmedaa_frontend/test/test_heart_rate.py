from backend_mock.heart import HeartRateMonitor


def test_heart_rate_within_expected_range():
    monitor = HeartRateMonitor(user_id=1)
    value = monitor.read()

    assert 40 <= value <= 180

