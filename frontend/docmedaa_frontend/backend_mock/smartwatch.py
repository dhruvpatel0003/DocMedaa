class ConnectionResult:
    def __init__(self, success, error=None):
        self.success = success
        self.error = error


def connect_watch(user_id, device_token):
    # Very simple mock logic
    if device_token == "VALID_TOKEN":
        return ConnectionResult(success=True)
    return ConnectionResult(success=False, error="Invalid token")
