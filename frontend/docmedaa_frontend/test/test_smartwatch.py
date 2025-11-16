from backend_mock.smartwatch import connect_watch


def test_connect_smartwatch_success():
    result = connect_watch(user_id=1, device_token="VALID_TOKEN")
    assert result.success is True
    assert result.error is None


def test_connect_smartwatch_invalid_token():
    result = connect_watch(user_id=1, device_token="BAD_TOKEN")
    assert result.success is False
    assert result.error is not None

