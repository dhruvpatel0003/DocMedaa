from backend_mock.tracking import calculate_calories, StepTracker


def test_calorie_calculation_from_steps():
    calories = calculate_calories(steps=10_000, weight_kg=70)
    assert calories > 0
    assert calories < 2000  # sanity bound


def test_track_steps_accumulates():
    tracker = StepTracker()
    tracker.add(steps=5000)
    tracker.add(steps=3000)

    assert tracker.total_steps == 8000

