import 'package:flutter/material.dart';
import '../../widgets/app_shell.dart';

class DoctorDashboardProfile extends StatelessWidget {
  const DoctorDashboardProfile({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppShell(
        title: 'Home',
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Wrap(
            spacing: 24,
            runSpacing: 24,
            children: const [
              _Square('Appointments'),
              _Square('Chat with Dr'),
              _Square('Devices'),
              _Square('Resources'),
              _Square('Help'),
            ],
          ),
        ),
      ),
    );
  }
}

class _Square extends StatelessWidget {
  final String label;
  const _Square(this.label);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (_, c) {
        final double s = c.maxWidth.clamp(280.0, 900.0) / 7.5;
        final double size = s.clamp(84.0, 120.0);
        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: const Border.fromBorderSide(
              BorderSide(color: Color(0xFFECECEC)),
            ),
          ),
          child: Center(
            child: Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        );
      },
    );
  }
}
