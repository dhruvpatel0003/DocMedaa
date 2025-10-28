import 'package:flutter/material.dart';
import 'Screens/patientnewappointmentscreen.dart';
import 'Screens/patientappointmentscreen.dart';
// ⚠️ Make sure the filename matches exactly. If your file is named
// doctor_appointments_screen.dart then update the import accordingly.
import 'Screens/doctorappointmentscreen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DocMedaa',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'DocMedaa Home'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() => setState(() => _counter++);

  void _openNewAppointmentScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const PatientNewAppointmentScreen()),
    );
  }

  void _openAppointmentListScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PatientAppointmentScreen(
          appointments: [],
          onDelete: (appt) {},
        ),
      ),
    );
  }

  void _openDoctorAppointmentsScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const DoctorAppointmentsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        key: const Key('appbar_home'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Icon(Icons.local_hospital, size: 80, color: Colors.deepPurple),
              const SizedBox(height: 20),
              Text(
                'Welcome to DocMedaa',
                key: const Key('txt_welcome'),
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.deepPurple,
                    ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Your medical assistant platform for both patients and doctors',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // ---- Buttons ----
              ElevatedButton.icon(
                key: const Key('btn_book_new_appointment'),
                onPressed: _openNewAppointmentScreen,
                icon: const Icon(Icons.add),
                label: const Text("Book New Appointment"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(220, 48),
                ),
              ),
              const SizedBox(height: 16),

              ElevatedButton.icon(
                key: const Key('btn_view_patient_appointments'),
                onPressed: _openAppointmentListScreen,
                icon: const Icon(Icons.calendar_today),
                label: const Text("View Patient Appointments"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(220, 48),
                ),
              ),
              const SizedBox(height: 16),

              ElevatedButton.icon(
                key: const Key('btn_doctor_dashboard'),
                onPressed: _openDoctorAppointmentsScreen,
                icon: const Icon(Icons.medical_services_outlined),
                label: const Text("Doctor Appointment Dashboard"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(220, 48),
                ),
              ),
              const SizedBox(height: 40),

              const Text('You have pressed this button this many times:'),
              Text(
                '$_counter',
                key: const Key('txt_counter_value'),
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        key: const Key('fab_increment'),            // ✅ unique for tests
        onPressed: _incrementCounter,
        tooltip: 'Increment Counter',               // (you can also use byTooltip in tests)
        child: const Icon(Icons.add),
      ),
    );
  }
}
