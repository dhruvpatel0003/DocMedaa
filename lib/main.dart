import 'package:flutter/material.dart';
import 'ui/screens/login_screen.dart';
import 'ui/screens/signup_screen.dart';
import 'ui/screens/send_email_link_screen.dart';
import 'ui/screens/resend_password_link_screen.dart';
import 'ui/screens/reset_password_screen.dart';
import 'ui/screens/help_screen.dart';


void main() {
  runApp(const DocMedaaApp());
}

class DocMedaaApp extends StatelessWidget {
  const DocMedaaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'DocMedaa',
      initialRoute: '/login',
      routes: {
        '/login': (context) => const LoginScreen(),
        '/signup': (context) => const SignUpScreen(),
        '/sendEmailLink': (context) => const SendEmailLinkScreen(),
        '/resendPasswordLink': (context) => const ResendPasswordLinkScreen(),
        '/resetPassword': (context) => const ResetPasswordScreen(),
        '/help': (context) => const HelpScreen(),
      },
    );
  }
}




