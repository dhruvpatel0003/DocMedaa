class Appointment {
  final String id;            // unique id
  final String doctorName;
  final String location;
  final DateTime date;
  final String slot;
  final String type;          // 'In-Person' | 'Virtual'
  final String notes;
  final String status;        // 'Scheduled' | 'Cancelled'

  Appointment({
    required this.id,
    required this.doctorName,
    required this.location,
    required this.date,
    required this.slot,
    required this.type,
    required this.notes,
    this.status = 'Scheduled',
  });

  Appointment copyWith({
    String? id,
    String? doctorName,
    String? location,
    DateTime? date,
    String? slot,
    String? type,
    String? notes,
    String? status,
  }) {
    return Appointment(
      id: id ?? this.id,
      doctorName: doctorName ?? this.doctorName,
      location: location ?? this.location,
      date: date ?? this.date,
      slot: slot ?? this.slot,
      type: type ?? this.type,
      notes: notes ?? this.notes,
      status: status ?? this.status,
    );
  }
}

