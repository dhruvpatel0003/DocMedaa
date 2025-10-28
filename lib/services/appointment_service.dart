class Appointment {
  final String id;
  final String patientId;
  final String doctorId;
  final DateTime start; // inclusive
  final DateTime end;   // exclusive
  final String location;
  final String type; // virtual | in-person
  final String status; // scheduled | cancelled

  Appointment({
    required this.id,
    required this.patientId,
    required this.doctorId,
    required this.start,
    required this.end,
    required this.location,
    required this.type,
    required this.status,
  });

  Appointment copyWith({
    DateTime? start,
    DateTime? end,
    String? location,
    String? type,
    String? status,
  }) {
    return Appointment(
      id: id,
      patientId: patientId,
      doctorId: doctorId,
      start: start ?? this.start,
      end: end ?? this.end,
      location: location ?? this.location,
      type: type ?? this.type,
      status: status ?? this.status,
    );
  }
}

abstract class AppointmentRepository {
  Future<void> create(Appointment a);
  Future<void> update(Appointment a);
  Future<Appointment?> get(String id);
  Future<List<Appointment>> listByDoctor(String doctorId);
  Future<List<Appointment>> listByPatient(String patientId);
}

class InMemoryAppointmentRepository implements AppointmentRepository {
  final Map<String, Appointment> _db = {};

  @override
  Future<void> create(Appointment a) async => _db[a.id] = a;

  @override
  Future<Appointment?> get(String id) async => _db[id];

  @override
  Future<List<Appointment>> listByDoctor(String doctorId) async =>
      _db.values.where((a) => a.doctorId == doctorId).toList();

  @override
  Future<List<Appointment>> listByPatient(String patientId) async =>
      _db.values.where((a) => a.patientId == patientId).toList();

  @override
  Future<void> update(Appointment a) async => _db[a.id] = a;
}

abstract class ReminderScheduler {
  Future<void> schedule(String apptId, DateTime at, String channel);
  Future<void> cancelAll(String apptId);
}

/// Service: checks conflicts, books, reschedules, cancels, and manages reminders.
class AppointmentService {
  final AppointmentRepository repo;
  final ReminderScheduler reminders;

  AppointmentService({required this.repo, required this.reminders});

  /// Conflict if [start,end) overlaps any existing appointment for the same doctor.
  Future<bool> _hasDoctorConflict(String doctorId, DateTime start, DateTime end,
      {String? excludeApptId}) async {
    final existing = await repo.listByDoctor(doctorId);
    for (final a in existing) {
      if (excludeApptId != null && a.id == excludeApptId) continue;
      final overlap = start.isBefore(a.end) && end.isAfter(a.start);
      if (overlap && a.status != 'cancelled') return true;
    }
    return false;
  }

  Future<Appointment> book({
    required String id,
    required String patientId,
    required String doctorId,
    required DateTime start,
    required DateTime end,
    required String location,
    required String type,
  }) async {
    if (await _hasDoctorConflict(doctorId, start, end)) {
      throw StateError('conflict');
    }
    final appt = Appointment(
      id: id,
      patientId: patientId,
      doctorId: doctorId,
      start: start,
      end: end,
      location: location,
      type: type,
      status: 'scheduled',
    );
    await repo.create(appt);

    // schedule reminders: 24h and 1h before (if in future)
    await _scheduleStandardReminders(appt);
    return appt;
  }

  Future<Appointment> reschedule({
    required String id,
    required DateTime newStart,
    required DateTime newEnd,
  }) async {
    final existing = await repo.get(id);
    if (existing == null) throw StateError('not_found');

    if (await _hasDoctorConflict(existing.doctorId, newStart, newEnd,
        excludeApptId: id)) {
      throw StateError('conflict');
    }

    final updated = existing.copyWith(start: newStart, end: newEnd);
    await repo.update(updated);

    // re-schedule reminders
    await reminders.cancelAll(id);
    await _scheduleStandardReminders(updated);
    return updated;
  }

  Future<void> cancel(String id) async {
    final existing = await repo.get(id);
    if (existing == null) throw StateError('not_found');
    final updated = existing.copyWith(status: 'cancelled');
    await repo.update(updated);
    await reminders.cancelAll(id);
  }

  Future<void> _scheduleStandardReminders(Appointment a) async {
    final now = DateTime.now();
    final t24 = a.start.subtract(const Duration(hours: 24));
    final t01 = a.start.subtract(const Duration(hours: 1));
    if (t24.isAfter(now)) {
      await reminders.schedule(a.id, t24, '24h_before');
    }
    if (t01.isAfter(now)) {
      await reminders.schedule(a.id, t01, '1h_before');
    }
  }
}
