import 'package:flutter/material.dart';
import '../models/appointment.dart';
import 'patientnewappointmentscreen.dart';
import 'patientappointmentdetailscreen.dart';

class PatientAppointmentScreen extends StatefulWidget {
  const PatientAppointmentScreen({
    super.key,
    required this.appointments,
    required this.onDelete,
  });

  final List<Appointment> appointments;
  final void Function(Appointment appt) onDelete;

  @override
  State<PatientAppointmentScreen> createState() =>
      _PatientAppointmentScreenState();
}

class _PatientAppointmentScreenState extends State<PatientAppointmentScreen> {
  static const double kDesktopBreakpoint = 800;
  String _query = '';

  List<Appointment> get _filtered {
    if (_query.trim().isEmpty) return widget.appointments;
    final q = _query.toLowerCase();
    return widget.appointments.where((a) {
      return a.doctorName.toLowerCase().contains(q) ||
          a.location.toLowerCase().contains(q) ||
          a.type.toLowerCase().contains(q) ||
          a.slot.toLowerCase().contains(q) ||
          a.status.toLowerCase().contains(q);
    }).toList();
  }

  Future<void> _refresh() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Refreshed')),
      );
    }
  }

  Future<void> _reschedule(Appointment appt) async {
    final updated = await Navigator.push<Appointment>(
      context,
      MaterialPageRoute(
        builder: (_) =>
            PatientNewAppointmentScreen(initial: appt, mode: 'edit'),
      ),
    );
    if (updated != null) {
      final idx = widget.appointments.indexWhere((a) => a.id == appt.id);
      if (idx != -1) {
        setState(() => widget.appointments[idx] = updated);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Appointment rescheduled')),
          );
        }
      }
    }
  }

  void _cancel(Appointment appt) {
    final idx = widget.appointments.indexWhere((a) => a.id == appt.id);
    if (idx != -1) {
      setState(() => widget.appointments[idx] =
          appt.copyWith(status: 'Cancelled'));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Appointment cancelled')),
      );
    }
  }

  Future<void> _editNotes(Appointment appt) async {
    final controller = TextEditingController(text: appt.notes);
    final newNotes = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Edit Notes'),
        content: TextField(
          controller: controller,
          maxLines: 4,
          decoration: const InputDecoration(hintText: 'Enter notes...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text), child: const Text('Save')),
        ],
      ),
    );
    if (newNotes != null) {
      final idx = widget.appointments.indexWhere((a) => a.id == appt.id);
      if (idx != -1) {
        setState(() => widget.appointments[idx] =
            appt.copyWith(notes: newNotes));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes updated')),
        );
      }
    }
  }

  void _openDetails(Appointment appt) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PatientAppointmentDetailScreen(
          appt: appt,
          onUpdate: (updated) {
            final idx = widget.appointments.indexWhere((a) => a.id == updated.id);
            if (idx != -1) setState(() => widget.appointments[idx] = updated);
          },
          onDelete: (toDelete) {
            setState(() => widget.appointments.removeWhere((a) => a.id == toDelete.id));
          },
        ),
      ),
    );
  }

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
                onPressed: () {},
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

  // ----------------- DESKTOP -----------------
  Widget _desktop() {
    return SafeArea(
      child: Row(
        children: [
          _sidebar(),
          Expanded(
            child: Column(
              children: [
                _topBrandBar(),
                Expanded(
                  child: Row(
                    children: [
                      Container(width: 220, color: Colors.transparent),
                      Expanded(child: _contentPanel()),
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
          const Spacer(),
        ],
      ),
    );
  }

  Widget _navItem(IconData icon, String label) {
    return ListTile(
      leading: Icon(icon, color: Colors.black87),
      horizontalTitleGap: 8,
      dense: true,
      title: Text(label),
      onTap: () {},
    );
  }

  Widget _topBrandBar() {
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
          const Text(
            'DocMedaa',
            style: TextStyle(
              color: Color(0xFF1347C7),
              fontSize: 22,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          Container(
            width: 36,
            height: 36,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFFE0E0E0),
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

  Widget _contentPanel() {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
        children: [
          Row(
            children: [
              TextButton.icon(
                onPressed: () => Navigator.maybePop(context),
                icon: const Icon(Icons.arrow_back_ios_new, size: 16),
                label: const Text('Back'),
              ),
              const Spacer(),
              IconButton(
                tooltip: 'Filter',
                icon: const Icon(Icons.filter_list),
                onPressed: _openFilterSheet,
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Search
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: TextField(
                onChanged: (v) => setState(() => _query = v),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search),
                  hintText: 'Search doctor, location, type, status…',
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

          const SizedBox(height: 16),

          // New Appointment
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 320),
              child: FilledButton(
                onPressed: () async {
                  final appt = await Navigator.push<Appointment>(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const PatientNewAppointmentScreen(),
                    ),
                  );
                  if (appt != null) {
                    setState(() => widget.appointments.add(appt));
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Added ${appt.doctorName}')),
                      );
                    }
                  }
                },
                style: ButtonStyle(
                  minimumSize: MaterialStateProperty.all(const Size(0, 48)),
                  shape: MaterialStateProperty.all(
                    RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24)),
                  ),
                  backgroundColor:
                      MaterialStateProperty.all(const Color(0xFF1347C7)),
                ),
                child: const Text('New Appointment'),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Today header (simple; can be upgraded to date groups)
          Row(
            children: const [
              Text('Today',
                  style:
                      TextStyle(fontWeight: FontWeight.w600, color: Colors.black87)),
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
            ..._filtered.map((a) => _AppointmentTile(
                  appt: a,
                  onOpen: () => _openDetails(a), // 👈 NEW: open details screen
                  // (optional quick actions remain available)
                  onManage: () => _editNotes(a),
                  onReschedule: () => _reschedule(a),
                  onCancel: () => _cancel(a),
                  onDelete: () {
                    widget.onDelete(a);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Appointment deleted')),
                    );
                  },
                )),
        ],
      ),
    );
  }

  // ----------------- MOBILE -----------------
  Widget _mobile() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Appointments'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: _openFilterSheet),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.search),
                hintText: 'Search doctor, location, type, status…',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () async {
                final appt = await Navigator.push<Appointment>(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const PatientNewAppointmentScreen(),
                  ),
                );
                if (appt != null) {
                  setState(() => widget.appointments.add(appt));
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Added ${appt.doctorName}')),
                    );
                  }
                }
              },
              style: ButtonStyle(
                minimumSize: MaterialStateProperty.all(const Size(0, 48)),
                backgroundColor:
                    MaterialStateProperty.all(const Color(0xFF1347C7)),
              ),
              child: const Text('New Appointment'),
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
              ..._filtered.map((a) => _AppointmentTile(
                    appt: a,
                    onOpen: () => _openDetails(a), // 👈 NEW
                    onManage: () => _editNotes(a),
                    onReschedule: () => _reschedule(a),
                    onCancel: () => _cancel(a),
                    onDelete: () {
                      widget.onDelete(a);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Appointment deleted')),
                      );
                    },
                  )),
          ],
        ),
      ),
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
              runSpacing: 10,
              children: [
                const Text('Quick Filters',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                Wrap(
                  spacing: 8,
                  children: [
                    FilterChip(
                      label: const Text('Virtual'),
                      selected: _query.toLowerCase() == 'virtual',
                      onSelected: (_) => setState(() => _query = 'Virtual'),
                    ),
                    FilterChip(
                      label: const Text('In-Person'),
                      selected: _query.toLowerCase() == 'in-person',
                      onSelected: (_) => setState(() => _query = 'In-Person'),
                    ),
                    FilterChip(
                      label: const Text('Cancelled'),
                      selected: _query.toLowerCase() == 'cancelled',
                      onSelected: (_) => setState(() => _query = 'Cancelled'),
                    ),
                    FilterChip(
                      label: const Text('Scheduled'),
                      selected: _query.toLowerCase() == 'scheduled',
                      onSelected: (_) => setState(() => _query = 'Scheduled'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => setState(() => _query = ''),
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
}

// ---- Tile with tap → Details, plus optional quick actions ----
class _AppointmentTile extends StatelessWidget {
  const _AppointmentTile({
    required this.appt,
    required this.onOpen,
    required this.onManage,
    required this.onReschedule,
    required this.onCancel,
    required this.onDelete,
  });

  final Appointment appt;
  final VoidCallback onOpen;
  final VoidCallback onManage;
  final VoidCallback onReschedule;
  final VoidCallback onCancel;
  final VoidCallback onDelete;

  String _d(DateTime d) =>
      '${d.month.toString().padLeft(2, '0')}/${d.day.toString().padLeft(2, '0')}/${d.year}';

  Widget _statusChip(String status) {
    final cancelled = status == 'Cancelled';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: cancelled ? const Color(0xFFFFE5E5) : const Color(0xFFE7F5FF),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: cancelled ? const Color(0xFFB00020) : const Color(0xFF1347C7),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final subtitle =
        '${_d(appt.date)} • ${appt.slot}\n${appt.type} • ${appt.location}';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      child: ListTile(
        onTap: onOpen, // 👈 open full details screen
        leading: const CircleAvatar(child: Icon(Icons.person)),
        title: Text(appt.doctorName,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        isThreeLine: true,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _statusChip(appt.status),
            const SizedBox(width: 4),
            PopupMenuButton<String>(
              onSelected: (v) {
                switch (v) {
                  case 'manage': onManage(); break;
                  case 'reschedule': onReschedule(); break;
                  case 'cancel': onCancel(); break;
                  case 'delete': onDelete(); break;
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(
                    value: 'manage', child: Text('Manage (Edit Notes)')),
                const PopupMenuItem(
                    value: 'reschedule', child: Text('Reschedule')),
                if (appt.status != 'Cancelled')
                  const PopupMenuItem(value: 'cancel', child: Text('Cancel')),
                const PopupMenuItem(value: 'delete', child: Text('Delete')),
              ],
              child: const Icon(Icons.more_vert),
            ),
          ],
        ),
      ),
    );
  }
}
