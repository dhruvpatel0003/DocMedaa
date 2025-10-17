import 'package:flutter/material.dart';
import '../ui/screens/login_screen.dart';
import '../ui/screens/signup_screen.dart';
import '../ui/screens/send_email_link_screen.dart';
import '../ui/screens/resend_password_link_screen.dart';
import '../ui/screens/reset_password_screen.dart';

class AppRoutes {
  static const String login = '/login';
  static const String signup = '/signup';
  static const String sendEmailLink = '/sendEmailLink';
  static const String resendPasswordLink = '/resendPasswordLink';
  static const String resetPassword = '/resetPassword';

  static Map<String, WidgetBuilder> routes = {
    login: (context) => const LoginScreen(),
    signup: (context) => const SignUpScreen(),
    sendEmailLink: (context) => const SendEmailLinkScreen(),
    resendPasswordLink: (context) => const ResendPasswordLinkScreen(),
    resetPassword: (context) => const ResetPasswordScreen(),
  };
}



