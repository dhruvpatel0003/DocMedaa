import 'package:flutter/material.dart';

class SendEmailLinkScreen extends StatelessWidget {
  const SendEmailLinkScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(   // ✅ prevents overlap with status bar
        child: Stack(
          children: [
            // 🔙 Back arrow (top-left)
            Positioned(
              left: 29,
              top: 24,
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: const Icon(
                  Icons.arrow_back_ios_new,
                  size: 20,
                  color: Colors.black,
                ),
              ),
            ),

            // 📩 Send Email Link button
            Positioned(
              left: 54,
              top: 199,
              child: GestureDetector(
                onTap: () {
                  // Navigate to Resend Password Link screen
                  Navigator.pushNamed(context, '/resendPasswordLink');
                },
                child: Container(
                  width: 323,
                  height: 68,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B30B2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Text(
                      'Send Email Link',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}





