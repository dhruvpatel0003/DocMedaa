import 'package:flutter/material.dart';
import '../../widgets/app_shell.dart';

/// Dedicated route that renders the grey rounded "Mute / Delete" popup.
/// Matches your Figma. Navigates back after selecting an option.
class PatientChatWithDrThreeDots extends StatelessWidget {
  const PatientChatWithDrThreeDots({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppShell(
        title: 'Back',
        showBack: true,
        child: Center(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final bool isMobile = constraints.maxWidth < 600;
              return Container(
                width: isMobile ? 160 : 180,
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E5E5),
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: const Color(0xFFE0E0E0)),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 6,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _OptionTile(
                      text: 'Mute',
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Chat muted (demo)')),
                        );
                        Navigator.pop(context);
                      },
                    ),
                    const Divider(
                      height: 1,
                      color: Color(0xFFBDBDBD),
                      thickness: 0.8,
                    ),
                    _OptionTile(
                      text: 'Delete',
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Chat deleted (demo)')),
                        );
                        Navigator.pop(context);
                      },
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  final String text;
  final VoidCallback onTap;
  const _OptionTile({required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(15),
      child: Container(
        alignment: Alignment.center,
        width: double.infinity,
        height: 48,
        child: Text(
          text,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
