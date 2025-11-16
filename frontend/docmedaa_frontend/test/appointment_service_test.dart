import 'package:flutter_test/flutter_test.dart';
import '/Users/pruthatrivedi/Desktop/DocMedaa/frontend/docmedaa_frontend/lib/services/appointment_service.dart'; // adjust path if needed

class FakeReminderScheduler implements ReminderScheduler {
  final Map<String, List<Map<String, dynamic>>> calls = {};

  @override
  Future<void> cancelAll(String apptId) async {
    calls.putIfAbsent(apptId, () => []);
    calls[apptId]!.add({'op': 'cancelAll'});
  }

  @override
  Future<void> schedule(String apptId, DateTime at, String channel) async {
    calls.putIfAbsent(apptId, () => []);
    calls[apptId]!.add({'op': 'schedule', 'at': at, 'channel': channel});
  }
}

void main() {
  late AppointmentService svc;
  late InMemoryAppointmentRepository repo;
  late FakeReminderScheduler reminders;

  setUp(() {
    repo = InMemoryAppointmentRepository();
    reminders = FakeReminderScheduler();
    svc = AppointmentService(repo: repo, reminders: reminders);
  });

  test('book success schedules reminders (24h & 1h before)', () async {
    final now = DateTime.now();
    final start = now.add(const Duration(days: 2)); // in 48h
    final end = start.add(const Duration(minutes: 30));

    final a = await svc.book(
      id: 'a1',
      patientId: 'p1',
      doctorId: 'd1',
      start: start,
      end: end,
      location: 'Hoboken Center',
      type: 'in-person',
    );

    expect(a.status, 'scheduled');
    final calls = reminders.calls['a1'] ?? [];
    // Should include two schedules and no cancel
    expect(calls.where((m) => m['op'] == 'schedule').length, 2);

    final channels = calls
        .where((m) => m['op'] == 'schedule')
        .map((m) => m['channel'])
        .toSet();
    expect(channels, {'24h_before', '1h_before'});
  });

  test('book rejects conflict with same doctor overlapping time', () async {
    final base = DateTime(2025, 1, 1, 9);
    final a1 = await svc.book(
      id: 'a1',
      patientId: 'p1',
      doctorId: 'd1',
      start: base,
      end: base.add(const Duration(minutes: 30)),
      location: 'NYC',
      type: 'virtual',
    );
    expect(a1.id, 'a1');

    // Overlap: starts before a1 ends, ends after a1 starts
    expect(
      () => svc.book(
        id: 'a2',
        patientId: 'p2',
        doctorId: 'd1',
        start: base.add(const Duration(minutes: 15)),
        end: base.add(const Duration(minutes: 45)),
        location: 'NYC',
        type: 'virtual',
      ),
      throwsA(isA<StateError>()),
    );
  });

  test('reschedule updates time and re-schedules reminders', () async {
    final start = DateTime.now().add(const Duration(days: 1, hours: 2));
    final end = start.add(const Duration(minutes: 30));
    await svc.book(
      id: 'a1',
      patientId: 'p1',
      doctorId: 'd1',
      start: start,
      end: end,
      location: 'Hoboken',
      type: 'virtual',
    );
    final callsBefore = reminders.calls['a1']!;
    expect(callsBefore.where((m) => m['op'] == 'schedule').length, 2);

    // New slot tomorrow + 5 hours
    final newStart = start.add(const Duration(hours: 5));
    final newEnd = newStart.add(const Duration(minutes: 30));
    final updated = await svc.reschedule(id: 'a1', newStart: newStart, newEnd: newEnd);

    expect(updated.start, newStart);
    final calls = reminders.calls['a1']!;
    // One cancelAll + two new schedules
    expect(calls.where((m) => m['op'] == 'cancelAll').length, 1);
    expect(calls.where((m) => m['op'] == 'schedule').length, 4);
  });

  test('reschedule rejects conflict against other appt of same doctor', () async {
    final base = DateTime(2025, 1, 1, 9);
    await svc.book(
      id: 'a1',
      patientId: 'p1',
      doctorId: 'd1',
      start: base,
      end: base.add(const Duration(minutes: 30)),
      location: 'A',
      type: 'virtual',
    );
    await svc.book(
      id: 'a2',
      patientId: 'p2',
      doctorId: 'd1',
      start: base.add(const Duration(hours: 1)),
      end: base.add(const Duration(hours: 1, minutes: 30)),
      location: 'B',
      type: 'in-person',
    );

    // Try to move a2 into a1’s slot → conflict
    expect(
      () => svc.reschedule(
        id: 'a2',
        newStart: base.add(const Duration(minutes: 10)),
        newEnd: base.add(const Duration(minutes: 40)),
      ),
      throwsA(isA<StateError>()),
    );
  });

  test('cancel marks cancelled and cancels reminders', () async {
    final base = DateTime.now().add(const Duration(days: 3));
    await svc.book(
      id: 'a1',
      patientId: 'p1',
      doctorId: 'd1',
      start: base,
      end: base.add(const Duration(minutes: 20)),
      location: 'Virtual',
      type: 'virtual',
    );
    await svc.cancel('a1');

    final stored = await repo.get('a1');
    expect(stored!.status, 'cancelled');

    final calls = reminders.calls['a1']!;
    expect(calls.where((m) => m['op'] == 'cancelAll').length, 1);
  });

  test('reminders in the past are skipped', () async {
    final start = DateTime.now().add(const Duration(hours: 2)); // soon
    final end = start.add(const Duration(minutes: 20));
    await svc.book(
      id: 'a1',
      patientId: 'p1',
      doctorId: 'd1',
      start: start,
      end: end,
      location: 'Virtual',
      type: 'virtual',
    );
    final calls = reminders.calls['a1']!;
    // Only 1h_before should be scheduled; 24h_before is in the past
    final channels =
        calls.where((m) => m['op'] == 'schedule').map((m) => m['channel']).toList();
    expect(channels, contains('1h_before'));
    expect(channels, isNot(contains('24h_before')));
  });
}
