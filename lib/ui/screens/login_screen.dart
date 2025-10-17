import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // DocMedaa logo
          Positioned(
            left: 111,
            top: 275,
            child: Image.asset(
              'assets/images/docmedaa_logo.png',
              width: 211,
              height: 70,
            ),
          ),

          // Username TextField
          Positioned(
            left: 31,
            top: 397,
            child: Container(
              width: 367,
              height: 57,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: const Color(0xFFD9D9D9)),
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: TextField(
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Username',
                    hintStyle: TextStyle(
                      color: Color(0xFF7A7A7A),
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Password TextField
          Positioned(
            left: 31,
            top: 477,
            child: Container(
              width: 367,
              height: 57,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: const Color(0xFFD9D9D9)),
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 4,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: TextField(
                  obscureText: true,
                  decoration: InputDecoration(
                    suffixIcon: Icon(Icons.visibility_off_outlined,
                        color: Colors.grey),
                    border: InputBorder.none,
                    hintText: 'Password',
                    hintStyle: TextStyle(
                      color: Color(0xFF7A7A7A),
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Create Account text
          const Positioned(
            left: 32,
            top: 545,
            child: Text(
              'Create an Account',
              style: TextStyle(
                fontSize: 12,
                color: Colors.black,
                fontFamily: 'Inter',
              ),
            ),
          ),

          // Sign Up link
          Positioned(
            left: 138,
            top: 545,
            child: GestureDetector(
              onTap: () {
                Navigator.pushNamed(context, '/signup');
              },
              child: Text(
                'SignUp',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.blue.shade800,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Inter',
                ),
              ),
            ),
          ),

          // Forgot Password link
          Positioned(
            left: 290,
            top: 545,
            child: GestureDetector(
              onTap: () {
                Navigator.pushNamed(context, '/sendEmailLink');
              },
              child: const Text(
                'Forgot Password ?',
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFF007AFF),
                  fontWeight: FontWeight.w500,
                  fontFamily: 'Inter',
                ),
              ),
            ),
          ),

          // Sign In button
          Positioned(
            left: 32,
            top: 590,
            child: GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Logged in successfully!')),
                );
              },
              child: Container(
                width: 367,
                height: 60,
                decoration: BoxDecoration(
                  color: const Color(0xFF0B30B2),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Center(
                  child: Text(
                    'Sign In',
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
    );
  }
}






