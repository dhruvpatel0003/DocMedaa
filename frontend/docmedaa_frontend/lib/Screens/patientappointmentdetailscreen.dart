import 'package:flutter/material.dart';
import '../models/appointment.dart';
import 'patientnewappointmentscreen.dart';

class PatientAppointmentDetailScreen extends StatefulWidget {
  const PatientAppointmentDetailScreen({
    super.key,
    required this.appt,
    required this.onUpdate,
    required this.onDelete,
  });

  final Appointment appt;
  final void Function(Appointment updated) onUpdate;
  final void Function(Appointment appt) onDelete;

  @override
  State<PatientAppointmentDetailScreen> createState() =>
      _PatientAppointmentDetailScreenState();
}

class _PatientAppointmentDetailScreenState
    extends State<PatientAppointmentDetailScreen> {
  late Appointment _appt;

  @override
  void initState() {
    super.initState();
    _appt = widget.appt;
  }

  String _d(DateTime d) =>
      '${d.month.toString().padLeft(2, '0')}/${d.day.toString().padLeft(2, '0')}/${d.year}';

  Widget _statusChip(String status) {
    final cancelled = status == 'Cancelled';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: cancelled ? const Color(0xFFFFE5E5) : const Color(0xFFE7F5FF),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontWeight: FontWeight.w700,
          color: cancelled ? const Color(0xFFB00020) : const Color(0xFF1347C7),
        ),
      ),
    );
  }

  Future<void> _reschedule() async {
    final updated = await Navigator.push<Appointment>(
      context,
      MaterialPageRoute(
        builder: (_) => PatientNewAppointmentScreen(
          initial: _appt,
          mode: 'edit',
        ),
      ),
    );
    if (updated != null) {
      setState(() => _appt = updated);
      widget.onUpdate(updated);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appointment rescheduled')),
        );
      }
    }
  }

  Future<void> _manageNotes() async {
    final controller = TextEditingController(text: _appt.notes);
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
      final updated = _appt.copyWith(notes: newNotes);
      setState(() => _appt = updated);
      widget.onUpdate(updated);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes updated')),
        );
      }
    }
  }

  Future<void> _cancel() async {
    if (_appt.status == 'Cancelled') return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Cancel appointment?'),
        content: const Text('This will mark the appointment as Cancelled.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Yes, cancel')),
        ],
      ),
    );
    if (confirm == true) {
      final updated = _appt.copyWith(status: 'Cancelled');
      setState(() => _appt = updated);
      widget.onUpdate(updated);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appointment cancelled')),
        );
      }
    }
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete appointment?'),
        content: const Text('This removes the appointment permanently.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirm == true) {
      widget.onDelete(_appt);
      if (mounted) {
        Navigator.pop(context); // go back to list
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appointment deleted')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = _appt.doctorName;

    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Center(child: _statusChip(_appt.status)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // When & Where
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: DefaultTextStyle.merge(
                style: const TextStyle(fontSize: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Details', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined, size: 20),
                        const SizedBox(width: 8),
                        Text('${_d(_appt.date)}  •  ${_appt.slot}'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.place_outlined, size: 20),
                        const SizedBox(width: 8),
                        Text('${_appt.location}  (${_appt.type})'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: const [
                        Icon(Icons.call_outlined, size: 20),
                        SizedBox(width: 8),
                        Text('+1-201-000-000 (example)'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Notes
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: DefaultTextStyle.merge(
                style: const TextStyle(fontSize: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Notes', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(_appt.notes.isEmpty ? '—' : _appt.notes),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerRight,
                      child: OutlinedButton.icon(
                        onPressed: _manageNotes,
                        icon: const Icon(Icons.edit_outlined),
                        label: const Text('Edit Notes'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Actions
          Wrap(
            runSpacing: 12,
            spacing: 12,
            children: [
              FilledButton.icon(
                onPressed: _reschedule,
                icon: const Icon(Icons.schedule),
                label: const Text('Reschedule'),
              ),
              OutlinedButton.icon(
                onPressed: _manageNotes,
                icon: const Icon(Icons.manage_accounts_outlined),
                label: const Text('Manage'),
              ),
              FilledButton.tonalIcon(
                onPressed: _appt.status == 'Cancelled' ? null : _cancel,
                icon: const Icon(Icons.cancel_outlined),
                label: const Text('Cancel'),
              ),
              TextButton.icon(
                onPressed: _delete,
                icon: const Icon(Icons.delete_outline),
                label: const Text('Delete'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
