import random

class HeartRateMonitor:
    def __init__(self, user_id):
        self.user_id = user_id

    def read(self):
        # return a realistic heart rate for testing
        return random.randint(60, 120)
