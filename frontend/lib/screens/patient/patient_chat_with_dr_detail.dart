import 'package:flutter/material.dart';
import '../../widgets/app_shell.dart';

class PatientChatWithDrDetail extends StatelessWidget {
  const PatientChatWithDrDetail({super.key});

  @override
  Widget build(BuildContext context) {
    final name =
        (ModalRoute.of(context)?.settings.arguments as String?) ?? 'Dr Chung';
    return Scaffold(
      body: AppShell(
        title: 'Back',
        showBack: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_horiz),
            onPressed: () => Navigator.pushNamed(context, '/patient_chat_menu'),
            tooltip: 'More',
          ),
        ],
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text('+00:00:000', style: TextStyle(fontSize: 12)),
                ],
              ),
              const SizedBox(height: 12),
              _grey(h: 16, w: 140),
              const SizedBox(height: 12),
              _grey(h: 56, w: 220),
              const SizedBox(height: 12),
              _grey(h: 72, w: 240),
              const Spacer(),
              Container(
                height: 52,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: const Color(0xFFECECEC)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: const Row(
                  children: [
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Type a message...',
                        ),
                      ),
                    ),
                    Icon(Icons.send),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _grey({required double h, required double w}) => Container(
    height: h,
    width: w,
    decoration: BoxDecoration(
      color: const Color(0xFFE5E5E5),
      borderRadius: BorderRadius.circular(15),
      border: Border.all(color: const Color(0xFFECECEC)),
    ),
  );
}
