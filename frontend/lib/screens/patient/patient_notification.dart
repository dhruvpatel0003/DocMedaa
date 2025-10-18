import 'package:flutter/material.dart';
import '../../widgets/app_shell.dart';

class PatientNotifications extends StatelessWidget {
  const PatientNotifications({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      {'name': 'Dr Chung', 'time': '45 min ago'},
      {'name': 'Dr Chung', 'time': '1 hr ago'},
    ];

    return Scaffold(
      body: AppShell(
        title: 'Back',
        showBack: true,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (ctx, i) {
              final n = items[i];
              return ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                leading: const CircleAvatar(backgroundColor: Color(0xFFEDEDED)),
                title: Text(
                  n['name']!,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: const Text(
                  'Dr Chung invited you to chat',
                  style: TextStyle(fontSize: 12),
                ),
                trailing: const Icon(Icons.delete_outline),
                onTap: () => Navigator.pushNamed(
                  ctx,
                  '/notification_detail',
                  arguments: n,
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
