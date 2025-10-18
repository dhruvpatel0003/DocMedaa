import 'package:flutter/material.dart';
import '../../widgets/app_shell.dart';

class PatientChatWithDr extends StatelessWidget {
  const PatientChatWithDr({super.key});

  @override
  Widget build(BuildContext context) {
    final chats = [
      {'name': 'Dr Chung', 'time': '+00:00:000', 'unread': 12},
      {'name': 'Dr Chung', 'time': '+00:00:000', 'unread': 0},
    ];

    return Scaffold(
      body: AppShell(
        title: 'Back',
        showBack: true,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ListView.separated(
            itemCount: chats.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (ctx, i) {
              final c = chats[i];
              return ListTile(
                leading: const CircleAvatar(backgroundColor: Color(0xFFEDEDED)),
                title: Text(
                  c['name'] as String,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Text(
                  c['time'] as String,
                  style: const TextStyle(fontSize: 12),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if ((c['unread'] as int) > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E8E3E),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${c['unread']}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.more_horiz),
                      onPressed: () =>
                          Navigator.pushNamed(context, '/patient_chat_menu'),
                      tooltip: 'More',
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.chevron_right),
                  ],
                ),
                onTap: () => Navigator.pushNamed(
                  ctx,
                  '/patient_chat_detail',
                  arguments: c['name'],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
