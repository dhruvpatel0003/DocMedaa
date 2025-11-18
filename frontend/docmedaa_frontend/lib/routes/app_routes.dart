import 'package:flutter/material.dart';

import '../screens/login_screen.dart';
import '../screens/resetPassword/sendEmail_screen.dart';
import '../screens/signUp_screen.dart';

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
    // resendPasswordLink: (context) => const ResendPasswordLinkScreen(),
    // resetPassword: (context) => const ResetPasswordScreen(),
  };
}


