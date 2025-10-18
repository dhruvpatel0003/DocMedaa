import 'package:flutter/material.dart';

import 'screens/patient/patient_dashboard.dart';
import 'screens/patient/patient_profile.dart';
import 'screens/patient/patient_notification.dart';
import 'screens/patient/patient_chat_with_dr.dart';
import 'screens/patient/patient_chat_with_dr_detail.dart';
import 'screens/patient/patient_chat_with_dr_three_dots.dart';
import 'screens/doctor/doctor_dashboard_profile.dart';
import 'screens/notification_detail.dart';

void main() => runApp(const DocMedaaApp());

class DocMedaaApp extends StatelessWidget {
  const DocMedaaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DocMedaa',
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        final ts = MediaQuery.of(
          context,
        ).textScaler.clamp(minScaleFactor: 0.9, maxScaleFactor: 1.2);
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(textScaler: ts),
          child: child!,
        );
      },
      theme: ThemeData(
        fontFamily: 'Inter',
        scaffoldBackgroundColor: Colors.white,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0B30B2)),
        useMaterial3: true,
      ),
      initialRoute: '/patient_dashboard',
      routes: {
        '/patient_dashboard': (_) => const PatientDashboard(),
        '/patient_profile': (_) => const PatientProfile(),
        '/patient_notification': (_) => const PatientNotifications(),
        '/notification_detail': (_) => const NotificationDetails(),
        '/patient_chat': (_) => const PatientChatWithDr(),
        '/patient_chat_detail': (_) => const PatientChatWithDrDetail(),
        '/patient_chat_menu': (_) => const PatientChatWithDrThreeDots(),
        '/doctor_dashboard': (_) => const DoctorDashboardProfile(),
      },
    );
  }
}
