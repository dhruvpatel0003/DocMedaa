import 'package:flutter/material.dart';

class ResendPasswordLinkScreen extends StatelessWidget {
  const ResendPasswordLinkScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // 🔙 Back button
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

            // 📝 Instruction text
            const Positioned(
              left: 54,
              top: 118,
              child: SizedBox(
                width: 323,
                child: Text(
                  'Reset Password link was sent on\nregistered email',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ),

            // 🔁 Resend Link button
            Positioned(
              left: 54,
              top: 199,
              child: GestureDetector(
                onTap: () {
                  Navigator.pushNamed(context, '/resetPassword');
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
                      'Resend Link',
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








