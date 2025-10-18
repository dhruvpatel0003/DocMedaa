import 'package:flutter/material.dart';
import '../widgets/app_shell.dart';

class NotificationDetails extends StatelessWidget {
  const NotificationDetails({super.key});

  @override
  Widget build(BuildContext context) {
    final Map<String, String>? n =
        ModalRoute.of(context)?.settings.arguments as Map<String, String>?;

    return Scaffold(
      body: AppShell(
        title: 'Back',
        showBack: true,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Align(
            alignment: Alignment.topLeft,
            child: Text(
              n?['name'] ?? 'Detail',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
          ),
        ),
      ),
    );
  }
}
