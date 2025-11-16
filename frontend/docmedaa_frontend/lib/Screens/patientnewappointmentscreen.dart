import 'package:flutter/material.dart';
import '../models/appointment.dart';

class PatientNewAppointmentScreen extends StatefulWidget {
  const PatientNewAppointmentScreen({
    super.key,
    this.initial,         // pass existing appt to edit/reschedule
    this.mode = 'create', // 'create' | 'edit'
  });

  final Appointment? initial;
  final String mode;

  @override
  State<PatientNewAppointmentScreen> createState() =>
      _PatientNewAppointmentScreenState();
}

class _PatientNewAppointmentScreenState
    extends State<PatientNewAppointmentScreen> {
  final List<String> doctors = [
    'Dr. Sarah Johnson',
    'Dr. Ravi Patel',
    'Dr. Emily Smith',
    'Dr. Ahmed Khan'
  ];

  final List<String> locations = [
    'Hoboken Center',
    'New York Clinic',
    'Virtual',
  ];

  final Map<String, bool> slotAvailability = {
    '08:30 AM - 09:00 AM': true,
    '09:30 AM - 10:00 AM': true,
    '10:30 AM - 11:00 AM': false,
    '11:30 AM - 12:00 PM': true,
    '02:00 PM - 02:30 PM': true,
    '03:00 PM - 03:30 PM': false,
  };

  String? selectedDoctor;
  String? selectedLocation;
  DateTime? selectedDate;
  String? selectedSlot;
  String appointmentType = 'In-Person';
  final TextEditingController notesController = TextEditingController();

  static const double kDesktopBreakpoint = 800;

  @override
  void initState() {
    super.initState();
    final a = widget.initial;
    if (a != null) {
      selectedDoctor   = a.doctorName;
      appointmentType  = a.type;
      selectedLocation = a.location == 'Virtual' ? null : a.location;
      selectedDate     = a.date;
      selectedSlot     = a.slot;
      notesController.text = a.notes;
    }
  }

  @override
  void dispose() {
    notesController.dispose();
    super.dispose();
  }

  bool get _isComplete =>
      selectedDoctor != null &&
      selectedDate != null &&
      selectedSlot != null &&
      (appointmentType == 'Virtual' || selectedLocation != null);

  String _formatDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')} ${_monthName(d.month)} ${d.year}';
  String _monthName(int m) {
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
    ];
    return months[m - 1];
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate ?? today,
      firstDate: today,
      lastDate: DateTime(now.year + 2),
    );
    if (picked != null) {
      setState(() {
        selectedDate = picked;
        selectedSlot = null; // clear slot when date changes
      });
    }
  }

  // create or update appointment and return it
  void _save() {
    if (!_isComplete) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all required fields.')),
      );
      return;
    }

    final id =
        widget.initial?.id ?? DateTime.now().millisecondsSinceEpoch.toString();

    final appt = Appointment(
      id: id,
      doctorName: selectedDoctor!,
      location: appointmentType == 'Virtual'
          ? 'Virtual'
          : (selectedLocation ?? 'Unknown'),
      date: selectedDate!,
      slot: selectedSlot!,
      type: appointmentType,
      notes: notesController.text,
      status: widget.initial?.status ?? 'Scheduled',
    );

    Navigator.pop(context, appt);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= kDesktopBreakpoint;
        return SafeArea(
          child: isDesktop ? _buildDesktop(context) : _buildMobile(context),
        );
      }),
    );
  }

  // ---------------------------
  // Desktop Layout
  // ---------------------------
  Widget _buildDesktop(BuildContext context) {
    return Row(
      children: [
        // Sidebar
        Container(
          width: 220,
          color: const Color(0xFFF7F7F7),
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'DocMedaa',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0046AD),
                ),
              ),
              const SizedBox(height: 20),
              _sidebarItem(Icons.notifications_outlined, 'Notification'),
              _sidebarItem(Icons.favorite_border, 'My Tracker'),
              _sidebarItem(Icons.history, 'History'),
              _sidebarItem(Icons.info_outline, 'About Us'),
              const Spacer(),
              const Text(
                'This side panel has 5 tabs — view doctor-dashboard for more info',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              const Row(
                children: [
                  Icon(Icons.close, size: 14),
                  SizedBox(width: 6),
                  Text('Close', style: TextStyle(fontSize: 13)),
                ],
              ),
            ],
          ),
        ),

        // Main content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 920),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x11000000),
                        blurRadius: 8,
                        offset: Offset(0, 4),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildTopRow(),
                      const SizedBox(height: 22),
                      _buildFormContent(isDesktop: true),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _sidebarItem(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon),
        title: Text(label),
        dense: true,
        horizontalTitleGap: 8,
      ),
    );
  }

  Widget _buildTopRow() {
    final title =
        widget.mode == 'edit' ? 'Edit Appointment' : 'New Appointment';
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Back + Title
        Row(
          children: [
            IconButton(
              onPressed: () => Navigator.maybePop(context),
              icon: const Icon(Icons.arrow_back_ios_new),
            ),
            const SizedBox(width: 6),
            Text(title,
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),

        // Save + Profile
        Row(
          children: [
            FilledButton.icon(
              onPressed: _isComplete ? _save : null,
              icon: const Icon(Icons.save),
              label: const Text('Save'),
              style: ButtonStyle(
                backgroundColor:
                    MaterialStateProperty.all(const Color(0xFF0046AD)),
                padding: MaterialStateProperty.all(
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 12)),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8))),
              ),
            ),
            const SizedBox(width: 12),
            const CircleAvatar(
              radius: 18,
              child: Icon(Icons.person),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFormContent({required bool isDesktop}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Doctor & Date Row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Doctor',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  _decoratedDropdown<String>(
                    value: selectedDoctor,
                    hint: 'Choose a doctor',
                    items: doctors,
                    onChanged: (v) => setState(() => selectedDoctor = v),
                  ),
                  const SizedBox(height: 18),
                  if (appointmentType == 'In-Person') ...[
                    const Text('Select Location',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    _decoratedDropdown<String>(
                      value: selectedLocation,
                      hint: 'Choose location',
                      items: locations.where((l) => l != 'Virtual').toList(),
                      onChanged: (v) => setState(() => selectedLocation = v),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Date',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  InkWell(
                    onTap: _pickDate,
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Text(selectedDate != null
                              ? _formatDate(selectedDate!)
                              : 'Pick a date'),
                          const Spacer(),
                          const Icon(Icons.calendar_today_outlined),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text('Available Slots',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: slotAvailability.entries.map((e) {
                      final time = e.key;
                      final available = e.value;
                      final selected = selectedSlot == time;
                      final disabledStyle = TextStyle(
                        color: Colors.grey.shade500,
                        decoration: TextDecoration.lineThrough,
                      );
                      return ChoiceChip(
                        label: Text(
                          available ? time : '$time • Not available',
                          style: selected
                              ? const TextStyle(color: Colors.white)
                              : (available ? null : disabledStyle),
                        ),
                        selected: selected,
                        onSelected: available
                            ? (v) =>
                                setState(() => selectedSlot = v ? time : null)
                            : null,
                        backgroundColor: Colors.grey.shade100,
                        selectedColor: const Color(0xFF0046AD),
                        labelStyle: TextStyle(
                            color: selected ? Colors.white : Colors.black87),
                        side: BorderSide(
                            color:
                                available ? Colors.transparent : Colors.red),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Appointment Type + Notes
        Row(
          children: [
            Expanded(
              flex: 2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Appointment Type',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Radio<String>(
                        value: 'In-Person',
                        groupValue: appointmentType,
                        onChanged: (v) => setState(
                            () => appointmentType = v ?? appointmentType),
                      ),
                      const Text('In-Person'),
                      const SizedBox(width: 18),
                      Radio<String>(
                        value: 'Virtual',
                        groupValue: appointmentType,
                        onChanged: (v) => setState(
                            () => appointmentType = v ?? appointmentType),
                      ),
                      const Text('Virtual'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              flex: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Additional Notes',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: notesController,
                    maxLines: 4,
                    textInputAction: TextInputAction.done,
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      hintText: 'Add any notes here...',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        Row(
          children: [
            const Spacer(),
            FilledButton(
              onPressed: _isComplete ? _save : null,
              style: ButtonStyle(
                backgroundColor:
                    MaterialStateProperty.all(const Color(0xFF0046AD)),
                padding: MaterialStateProperty.all(
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 14)),
                shape: MaterialStateProperty.all(RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
              ),
              child: const Text(
                'Save & Close',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ],
        ),
      ],
    );
  }

  DropdownButtonFormField<T> _decoratedDropdown<T>({
    T? value,
    required String hint,
    required List<T> items,
    required ValueChanged<T?> onChanged,
  }) {
    return DropdownButtonFormField<T>(
      value: value,
      items: items
          .map((e) => DropdownMenuItem<T>(value: e, child: Text(e.toString())))
          .toList(),
      onChanged: onChanged,
      decoration: InputDecoration(
        filled: true,
        fillColor: Colors.grey.shade100,
        hintText: hint,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide.none,
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      ),
    );
  }

  // ---------------------------
  // Mobile Layout
  // ---------------------------
  Widget _buildMobile(BuildContext context) {
    return Column(
      children: [
        AppBar(
          backgroundColor: const Color(0xFF0046AD),
          title: Text(widget.mode == 'edit'
              ? 'Edit Appointment'
              : 'New Appointment'),
          actions: [
            IconButton(
              icon: const Icon(Icons.save),
              onPressed: _isComplete ? _save : null,
            ),
          ],
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select Doctor',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: const [
                      BoxShadow(
                          color: Color(0x11000000),
                          blurRadius: 6,
                          offset: Offset(0, 3))
                    ],
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(radius: 28, child: Icon(Icons.person)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: selectedDoctor,
                          items: doctors
                              .map((e) =>
                                  DropdownMenuItem(value: e, child: Text(e)))
                              .toList(),
                          onChanged: (v) => setState(() => selectedDoctor = v),
                          decoration:
                              const InputDecoration(border: InputBorder.none),
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                const Text('Select Date',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                InkWell(
                  onTap: _pickDate,
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Text(selectedDate != null
                            ? _formatDate(selectedDate!)
                            : 'Pick a date'),
                        const Spacer(),
                        const Icon(Icons.calendar_today_outlined),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                const Text('Available Slots',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Column(
                  children: slotAvailability.entries.map((e) {
                    final time = e.key;
                    final available = e.value;
                    return ListTile(
                      leading: Radio<String>(
                        value: time,
                        groupValue: selectedSlot,
                        onChanged: available
                            ? (v) => setState(() => selectedSlot = v)
                            : null,
                      ),
                      title: Text(time),
                      trailing: Text(
                        available ? 'Available' : 'Not available',
                        style: TextStyle(
                            color: available ? Colors.green : Colors.red),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),

                const Text('Appointment Type',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Row(
                  children: [
                    Radio<String>(
                      value: 'In-Person',
                      groupValue: appointmentType,
                      onChanged: (v) => setState(() => appointmentType = v!),
                    ),
                    const Text('In-Person'),
                    const SizedBox(width: 12),
                    Radio<String>(
                      value: 'Virtual',
                      groupValue: appointmentType,
                      onChanged: (v) => setState(() => appointmentType = v!),
                    ),
                    const Text('Virtual'),
                  ],
                ),

                const SizedBox(height: 14),
                if (appointmentType == 'In-Person') ...[
                  const Text('Select Location',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  _decoratedDropdown<String>(
                    value: selectedLocation,
                    hint: 'Choose location',
                    items: locations.where((l) => l != 'Virtual').toList(),
                    onChanged: (v) => setState(() => selectedLocation = v),
                  ),
                ],

                const SizedBox(height: 14),
                const Text('Additional Notes',
                    style:
                        TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                TextField(
                  controller: notesController,
                  maxLines: 4,
                  textInputAction: TextInputAction.done,
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.grey.shade100,
                    hintText: 'Add notes here...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 22),
                Center(
                  child: ElevatedButton.icon(
                    onPressed: _isComplete ? _save : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0046AD),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 28, vertical: 14),
                    ),
                    icon: const Icon(Icons.done),
                    label: const Text(
                      'Save & Close',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
