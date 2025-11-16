class StepTracker:
    def __init__(self):
        self.total_steps = 0

    def add(self, steps):
        self.total_steps += steps


def calculate_calories(steps, weight_kg):
    # Super simple formula just for testing
    return 0.04 * steps * (weight_kg / 70)
