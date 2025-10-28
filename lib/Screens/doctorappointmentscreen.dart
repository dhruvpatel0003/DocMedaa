import 'package:flutter/material.dart';

/// Doctor view: searchable list, stats, filters, complete/remaining toggles,
/// edit notes, and reschedule (date + time slot picker).
class DoctorAppointmentsScreen extends StatefulWidget {
  const DoctorAppointmentsScreen({super.key});

  @override
  State<DoctorAppointmentsScreen> createState() =>
      _DoctorAppointmentsScreenState();
}

class _DoctorAppointmentsScreenState extends State<DoctorAppointmentsScreen> {
  static const double kDesktopBreakpoint = 800;

  // ----- Mock data for demo -----
  final List<DoctorAppt> _appts = [
    DoctorAppt(
      id: 'a1',
      patientName: 'Mr. ABC',
      doctorName: 'Dr. Ahmed Khan',
      cityLine: 'New York, New York\n000011',
      phone: '+1-201-000-000',
      date: DateTime.now(),
      timeRange: '08:00–08:30 AM',
      visitType: 'Virtual',
      notes: 'Patient reports mild fatigue.',
      tags: const ['Symptoms', 'Weakness'],
      isCompleted: false,
      isRemaining: true,
    ),
    DoctorAppt(
      id: 'a2',
      patientName: 'Ms. Jane Doe',
      doctorName: 'Dr. Emily Smith',
      cityLine: 'Hoboken, New Jersey\n07030',
      phone: '+1-201-555-0101',
      date: DateTime.now(),
      timeRange: '10:30–11:00 AM',
      visitType: 'In-Person',
      notes: 'Follow-up after blood work.',
      tags: const ['Follow-up'],
      isCompleted: true,
      isRemaining: false,
    ),
  ];

  // Simple slot list for rescheduling dialog
  final List<String> _slots = const [
    '08:00–08:30 AM',
    '08:30–09:00 AM',
    '09:00–09:30 AM',
    '09:30–10:00 AM',
    '10:30–11:00 AM',
    '11:30–12:00 PM',
    '02:00–02:30 PM',
    '03:00–03:30 PM',
  ];

  String _query = '';
  String _quickFilter = ''; // 'completed' | 'remaining' | 'virtual' | 'in-person' | ''

  // Derived stats
  int get _total => _appts.length;
  int get _completed => _appts.where((a) => a.isCompleted).length;
  int get _remaining => _appts.where((a) => a.isRemaining).length;

  // Search + quick filter
  List<DoctorAppt> get _filtered {
    Iterable<DoctorAppt> list = _appts;

    if (_quickFilter.isNotEmpty) {
      switch (_quickFilter) {
        case 'completed':
          list = list.where((a) => a.isCompleted);
          break;
        case 'remaining':
          list = list.where((a) => a.isRemaining);
          break;
        case 'virtual':
          list = list.where((a) => a.visitType.toLowerCase() == 'virtual');
          break;
        case 'in-person':
          list =
              list.where((a) => a.visitType.toLowerCase() == 'in-person');
          break;
      }
    }

    if (_query.trim().isEmpty) return list.toList();

    final q = _query.toLowerCase();
    return list
        .where((a) =>
            a.patientName.toLowerCase().contains(q) ||
            a.doctorName.toLowerCase().contains(q) ||
            a.cityLine.toLowerCase().contains(q) ||
            a.phone.toLowerCase().contains(q) ||
            a.timeRange.toLowerCase().contains(q) ||
            a.visitType.toLowerCase().contains(q))
        .toList();
  }

  // ----- Actions -----
  Future<void> _refresh() async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Refreshed')),
    );
  }

  void _toggleCompleted(DoctorAppt a) {
    setState(() {
      final i = _appts.indexWhere((x) => x.id == a.id);
      final nowCompleted = !_appts[i].isCompleted;
      _appts[i] = _appts[i].copyWith(
        isCompleted: nowCompleted,
        // if marked completed, it can’t be remaining
        isRemaining: nowCompleted ? false : _appts[i].isRemaining,
      );
    });
  }

  void _toggleRemaining(DoctorAppt a) {
    setState(() {
      final i = _appts.indexWhere((x) => x.id == a.id);
      final nowRem = !_appts[i].isRemaining;
      _appts[i] = _appts[i].copyWith(
        isRemaining: nowRem,
        // if marked remaining, it can’t be completed
        isCompleted: nowRem ? false : _appts[i].isCompleted,
      );
    });
  }

  Future<void> _editNotes(DoctorAppt a) async {
    final controller = TextEditingController(text: a.notes);
    final newNotes = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Edit Notes'),
        content: TextField(
          controller: controller,
          maxLines: 5,
          decoration: const InputDecoration(
            hintText: 'Enter notes…',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text), child: const Text('Save')),
        ],
      ),
    );
    if (newNotes != null) {
      setState(() {
        final i = _appts.indexWhere((x) => x.id == a.id);
        _appts[i] = _appts[i].copyWith(notes: newNotes);
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Notes updated')),
      );
    }
  }

  Future<void> _reschedule(DoctorAppt a) async {
    DateTime? pickedDate = a.date;
    String pickedSlot = a.timeRange;

    // Step 1: date picker
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: pickedDate,
      firstDate: DateTime(now.year, now.month, now.day),
      lastDate: DateTime(now.year + 1),
    );
    if (date == null) return; // cancelled

    // Step 2: slot picker (bottom sheet)
    pickedSlot = await showModalBottomSheet<String>(
          context: context,
          showDragHandle: true,
          builder: (_) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Pick a time slot',
                        style:
                            TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _slots
                          .map(
                            (s) => ChoiceChip(
                              label: Text(s),
                              selected: pickedSlot == s,
                              onSelected: (_) => Navigator.pop(context, s),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Close'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ) ??
        pickedSlot;

    // Save
    setState(() {
      final i = _appts.indexWhere((x) => x.id == a.id);
      _appts[i] = _appts[i].copyWith(date: date, timeRange: pickedSlot);
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Appointment rescheduled')),
    );
  }

  void _addToChat(DoctorAppt a) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added ${a.patientName} details to chat (mock)'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _openDirections(DoctorAppt a) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Open directions to: ${a.cityLine.split('\n').first} (mock)'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ----- UI -----
  @override
  Widget build(BuildContext context) {
    final isDesktop =
        MediaQuery.of(context).size.width >= kDesktopBreakpoint;

    return Scaffold(
      body: isDesktop ? _desktop() : _mobile(),
      floatingActionButton: isDesktop
          ? Padding(
              padding: const EdgeInsets.only(right: 12, bottom: 12),
              child: FloatingActionButton(
                onPressed: () =>
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Support coming soon…'),
                )),
                backgroundColor: Colors.grey.shade300,
                shape: const CircleBorder(),
                child: const Icon(Icons.headset_mic_outlined),
              ),
            )
          : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      backgroundColor: const Color(0xFFF6F6F8),
    );
  }

  // ----------------- DESKTOP LAYOUT -----------------
  Widget _desktop() {
    return SafeArea(
      child: Row(
        children: [
          _sidebar(),
          Expanded(
            child: Column(
              children: [
                _brandBar(),
                Expanded(
                  child: Row(
                    children: [
                      Container(width: 220, color: Colors.transparent),
                      Expanded(child: _content()),
                    ],
                  ),
                ),
                _bottomCloseBar(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sidebar() {
    return Container(
      width: 220,
      color: const Color(0xFFF3F3F3),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 72),
          _navItem(Icons.notifications_none, 'Notification'),
          _navItem(Icons.favorite_border, 'My Tracker'),
          _navItem(Icons.history, 'History'),
          _navItem(Icons.info_outline, 'About Us'),
          const SizedBox(height: 24),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'This side panel has 5 tabs — view doctor-dashboard for more info',
              style: TextStyle(fontSize: 12, color: Colors.black54),
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }

  Widget _navItem(IconData icon, String label) => ListTile(
        leading: Icon(icon, color: Colors.black87),
        dense: true,
        title: Text(label),
        onTap: () {},
      );

  Widget _brandBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE8E8E8))),
      ),
      child: Row(
        children: [
          const Icon(Icons.add_circle, color: Color(0xFFDA2C2C)),
          const SizedBox(width: 6),
          const Text('DocMedaa',
              style: TextStyle(
                  color: Color(0xFF1347C7),
                  fontSize: 22,
                  fontWeight: FontWeight.w700)),
          const Spacer(),
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _bottomCloseBar() {
    return Container(
      height: 56,
      decoration: const BoxDecoration(
        color: Color(0xFFF3F3F3),
        border: Border(top: BorderSide(color: Color(0xFFE8E8E8))),
      ),
      child: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 20),
        child: Align(
          alignment: Alignment.centerLeft,
          child: Row(
            children: [
              Icon(Icons.close, size: 16),
              SizedBox(width: 6),
              Text('Close'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _content() {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
        children: [
          // Top controls: Back | Stats | Filter
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextButton.icon(
                onPressed: () => Navigator.maybePop(context),
                icon: const Icon(Icons.arrow_back_ios_new, size: 16),
                label: const Text('Back'),
              ),
              const SizedBox(width: 16),
              _statChip(
                title: 'TOTAL',
                value: _total,
                bg: const Color(0xFF1347C7),
                fg: Colors.white,
              ),
              const SizedBox(width: 24),
              _statText('Completed', _completed, const Color(0xFF2E7D32)),
              const SizedBox(width: 24),
              _statText('Remaining', _remaining, const Color(0xFFEF6C00)),
              const Spacer(),
              IconButton(
                tooltip: 'Filter',
                icon: const Icon(Icons.filter_list),
                onPressed: _openFilterSheet,
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Search
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: TextField(
                onChanged: (v) => setState(() => _query = v),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Search patient, doctor, time, location…',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderSide: BorderSide.none,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Today header
          Row(
            children: const [
              Text('Today',
                  style: TextStyle(
                      fontWeight: FontWeight.w600, color: Colors.black87)),
              SizedBox(width: 12),
              Expanded(child: Divider(color: Color(0xFFE5E5E5), thickness: 1)),
            ],
          ),
          const SizedBox(height: 12),

          if (_filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.all(24.0),
              child: Center(child: Text('No appointments found.')),
            )
          else
            ..._filtered.map(
              (a) => _DoctorApptCard(
                appt: a,
                onTap: () => _openDetailsSheet(a),
                onCompleteToggle: () => _toggleCompleted(a),
                onRemainingToggle: () => _toggleRemaining(a),
                onAddToChat: () => _addToChat(a),
                onDirection: () => _openDirections(a),
              ),
            ),
        ],
      ),
    );
  }

  // ----------------- MOBILE LAYOUT -----------------
  Widget _mobile() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Doctor Appointments'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: _openFilterSheet),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _statChip(
                  title: 'TOTAL',
                  value: _total,
                  bg: const Color(0xFF1347C7),
                  fg: Colors.white,
                  compact: true,
                ),
                _statText('Completed', _completed, const Color(0xFF2E7D32)),
                _statText('Remaining', _remaining, const Color(0xFFEF6C00)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Search patient, doctor, time, location…',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('Today',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
            const SizedBox(height: 8),
            if (_filtered.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24.0),
                child: Center(child: Text('No appointments found.')),
              )
            else
              ..._filtered.map(
                (a) => _DoctorApptCard(
                  appt: a,
                  onTap: () => _openDetailsSheet(a),
                  onCompleteToggle: () => _toggleCompleted(a),
                  onRemainingToggle: () => _toggleRemaining(a),
                  onAddToChat: () => _addToChat(a),
                  onDirection: () => _openDirections(a),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // ----- Reusable bits -----
  Widget _statChip({
    required String title,
    required int value,
    required Color bg,
    required Color fg,
    bool compact = false,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 12 : 16,
        vertical: compact ? 8 : 12,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(title,
              style: TextStyle(
                  color: fg, fontWeight: FontWeight.w700, fontSize: compact ? 10 : 12)),
          Text('$value',
              style: TextStyle(
                  color: fg, fontWeight: FontWeight.w800, fontSize: compact ? 18 : 28)),
        ],
      ),
    );
  }

  Widget _statText(String label, int value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.w600, color: Colors.black54)),
        const SizedBox(height: 2),
        Text('$value',
            style:
                TextStyle(fontWeight: FontWeight.w800, color: color, fontSize: 22)),
      ],
    );
  }

  void _openFilterSheet() {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (_) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              runSpacing: 12,
              children: [
                const Text('Quick Filters',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                Wrap(
                  spacing: 8,
                  children: [
                    FilterChip(
                      label: const Text('Completed'),
                      selected: _quickFilter == 'completed',
                      onSelected: (_) =>
                          setState(() => _quickFilter = 'completed'),
                    ),
                    FilterChip(
                      label: const Text('Remaining'),
                      selected: _quickFilter == 'remaining',
                      onSelected: (_) =>
                          setState(() => _quickFilter = 'remaining'),
                    ),
                    FilterChip(
                      label: const Text('Virtual'),
                      selected: _quickFilter == 'virtual',
                      onSelected: (_) => setState(() => _quickFilter = 'virtual'),
                    ),
                    FilterChip(
                      label: const Text('In-Person'),
                      selected: _quickFilter == 'in-person',
                      onSelected: (_) =>
                          setState(() => _quickFilter = 'in-person'),
                    ),
                  ],
                ),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => setState(() {
                      _quickFilter = '';
                      _query = '';
                    }),
                    child: const Text('Clear'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _d(DateTime d) =>
      '${d.month.toString().padLeft(2, '0')}/${d.day.toString().padLeft(2, '0')}/${d.year}';

  void _openDetailsSheet(DoctorAppt a) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      builder: (_) {
        return Padding(
          padding: EdgeInsets.only(
            left: 16,
            right: 16,
            top: 12,
            bottom: MediaQuery.of(context).viewInsets.bottom + 16,
          ),
          child: Wrap(
            runSpacing: 10,
            children: [
              ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(a.patientName,
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('With ${a.doctorName}'),
                trailing: _statusPill(a),
              ),
              _detailRow(Icons.calendar_today_outlined, '${_d(a.date)}  •  ${a.timeRange}'),
              _detailRow(Icons.place_outlined, a.cityLine),
              _detailRow(Icons.call_outlined, a.phone),
              _detailRow(Icons.laptop_mac_outlined, a.visitType.toUpperCase()),
              const Divider(height: 20),
              const Text('Notes', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(a.notes.isEmpty ? '—' : a.notes),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: a.tags
                    .map((t) => Chip(
                          label: Text(t),
                          backgroundColor: const Color(0xFFF4F6FF),
                        ))
                    .toList(),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  FilledButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _reschedule(a);
                    },
                    icon: const Icon(Icons.schedule),
                    label: const Text('Reschedule'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      _editNotes(a);
                    },
                    icon: const Icon(Icons.edit_outlined),
                    label: const Text('Edit Notes'),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: () {
                      Navigator.pop(context);
                      _toggleCompleted(a);
                    },
                    icon: const Icon(Icons.check_circle),
                    label: Text(a.isCompleted ? 'Unmark Completed' : 'Mark Completed'),
                  ),
                  FilledButton.tonalIcon(
                    onPressed: () {
                      Navigator.pop(context);
                      _toggleRemaining(a);
                    },
                    icon: const Icon(Icons.cancel_outlined),
                    label: Text(a.isRemaining ? 'Unmark Remaining' : 'Mark Remaining'),
                  ),
                ],
              ),
              const SizedBox(height: 6),
            ],
          ),
        );
      },
    );
  }

  Widget _statusPill(DoctorAppt a) {
    String label;
    Color bg;
    Color fg;
    if (a.isCompleted) {
      label = 'Completed';
      bg = const Color(0xFFE8F5E9);
      fg = const Color(0xFF2E7D32);
    } else if (a.isRemaining) {
      label = 'Remaining';
      bg = const Color(0xFFFFF3E0);
      fg = const Color(0xFFEF6C00);
    } else {
      label = 'Scheduled';
      bg = const Color(0xFFE3F2FD);
      fg = const Color(0xFF1565C0);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(label,
          style: TextStyle(color: fg, fontWeight: FontWeight.w700)),
    );
  }

  Widget _detailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

// =================== Card ===================
class _DoctorApptCard extends StatelessWidget {
  const _DoctorApptCard({
    required this.appt,
    required this.onTap,
    required this.onCompleteToggle,
    required this.onRemainingToggle,
    required this.onAddToChat,
    required this.onDirection,
  });

  final DoctorAppt appt;
  final VoidCallback onTap;
  final VoidCallback onCompleteToggle;
  final VoidCallback onRemainingToggle;
  final VoidCallback onAddToChat;
  final VoidCallback onDirection;

  String _d(DateTime d) =>
      '${d.month.toString().padLeft(2, '0')}/${d.day.toString().padLeft(2, '0')}/${d.year}';

  @override
  Widget build(BuildContext context) {
    final checkColor = const Color(0xFF2E7D32);
    final xColor = const Color(0xFFB00020);

    return InkWell(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
                color: Color(0x11000000), blurRadius: 8, offset: Offset(0, 4))
          ],
        ),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(' ${appt.patientName}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700, fontSize: 16)),
                          const Spacer(),
                          TextButton(
                            onPressed: onDirection,
                            child: const Text('Direction >'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.place_outlined, size: 18),
                          const SizedBox(width: 6),
                          Expanded(child: Text(appt.cityLine)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.phone_outlined, size: 18),
                          const SizedBox(width: 6),
                          Text(appt.phone),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.notes_outlined, size: 18),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Row(
                              children: [
                                Flexible(child: Text(appt.notes.isEmpty ? '—' : appt.notes)),
                                const Spacer(),
                                GestureDetector(
                                  onTap: onAddToChat,
                                  child: const Text(
                                    'Add To Chat',
                                    style: TextStyle(
                                        color: Color(0xFF1347C7),
                                        fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(_d(appt.date)),
                    const SizedBox(height: 6),
                    Text(appt.timeRange),
                    const SizedBox(height: 8),
                    Text(
                      appt.visitType.toUpperCase(),
                      style: const TextStyle(
                          fontWeight: FontWeight.w700, letterSpacing: 0.6),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        IconButton(
                          tooltip: 'Mark completed',
                          onPressed: onCompleteToggle,
                          icon: Icon(Icons.check_circle,
                              color:
                                  appt.isCompleted ? checkColor : Colors.grey),
                        ),
                        IconButton(
                          tooltip: 'Mark remaining',
                          onPressed: onRemainingToggle,
                          icon: Icon(Icons.cancel,
                              color:
                                  appt.isRemaining ? xColor : Colors.grey),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F6FF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Wrap(
                spacing: 10,
                runSpacing: 6,
                children: appt.tags
                    .map((t) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(999),
                            border:
                                Border.all(color: const Color(0xFFE0E6FF)),
                          ),
                          child: Text(t,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600, fontSize: 12)),
                        ))
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =================== Data model ===================
class DoctorAppt {
  final String id;
  final String patientName;
  final String doctorName;
  final String cityLine;
  final String phone;
  final DateTime date;
  final String timeRange;
  final String visitType; // Virtual / In-Person
  final String notes;
  final List<String> tags;
  final bool isCompleted;
  final bool isRemaining;

  DoctorAppt({
    required this.id,
    required this.patientName,
    required this.doctorName,
    required this.cityLine,
    required this.phone,
    required this.date,
    required this.timeRange,
    required this.visitType,
    required this.notes,
    required this.tags,
    required this.isCompleted,
    required this.isRemaining,
  });

  DoctorAppt copyWith({
    String? id,
    String? patientName,
    String? doctorName,
    String? cityLine,
    String? phone,
    DateTime? date,
    String? timeRange,
    String? visitType,
    String? notes,
    List<String>? tags,
    bool? isCompleted,
    bool? isRemaining,
  }) {
    return DoctorAppt(
      id: id ?? this.id,
      patientName: patientName ?? this.patientName,
      doctorName: doctorName ?? this.doctorName,
      cityLine: cityLine ?? this.cityLine,
      phone: phone ?? this.phone,
      date: date ?? this.date,
      timeRange: timeRange ?? this.timeRange,
      visitType: visitType ?? this.visitType,
      notes: notes ?? this.notes,
      tags: tags ?? this.tags,
      isCompleted: isCompleted ?? this.isCompleted,
      isRemaining: isRemaining ?? this.isRemaining,
    );
  }
}
