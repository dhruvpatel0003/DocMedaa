import 'package:flutter/material.dart';

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Logo
          Positioned(
            left: 111,
            top: 232,
            child: SizedBox(
              width: 211,
              height: 70,
              child: Image.asset(
                'assets/images/docmedaa_logo.png',
                fit: BoxFit.contain,
              ),
            ),
          ),

          // Name field
          Positioned(
            left: 32,
            top: 344,
            child: SizedBox(
              width: 367,
              height: 57,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Name',
                  hintStyle: const TextStyle(color: Colors.grey),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 15),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                ),
              ),
            ),
          ),

          // Email field
          Positioned(
            left: 32,
            top: 424,
            child: SizedBox(
              width: 367,
              height: 57,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Email',
                  hintStyle: const TextStyle(color: Colors.grey),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 15),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                ),
              ),
            ),
          ),

          // New Password field
          Positioned(
            left: 32,
            top: 504,
            child: SizedBox(
              width: 367,
              height: 57,
              child: TextField(
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'New Password',
                  hintStyle: const TextStyle(color: Colors.grey),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 15),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                ),
              ),
            ),
          ),

          // Confirm Password field
          Positioned(
            left: 32,
            top: 583,
            child: SizedBox(
              width: 367,
              height: 57,
              child: TextField(
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Confirm Password',
                  hintStyle: const TextStyle(color: Colors.grey),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 15),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(15),
                    borderSide: const BorderSide(color: Colors.grey),
                  ),
                ),
              ),
            ),
          ),

          // “Already have an account?”
          const Positioned(
            left: 32,
            top: 663,
            child: Text(
              'Already have an account?',
              style: TextStyle(
                fontSize: 13,
                color: Colors.black54,
              ),
            ),
          ),

          // “Login” link (➡ goes back to login)
          Positioned(
            left: 182,
            top: 663,
            child: GestureDetector(
              onTap: () {
                Navigator.pushNamed(context, '/login');
              },
              child: const Text(
                'Login',
                style: TextStyle(
                  fontSize: 13,
                  color: Color(0xFF0038FF),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),

          // Sign Up button
          Positioned(
            left: 32,
            top: 722,
            child: SizedBox(
              width: 367,
              height: 60,
              child: ElevatedButton(
                onPressed: () {
                  // For now, just show a message
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Account Created!')),
                  );

                  // Then navigate to login page
                  Navigator.pushNamed(context, '/login');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0038FF),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Text(
                  'Sign Up',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
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






