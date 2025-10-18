import 'package:flutter/material.dart';

const _kPrimary = Color(0xFF0B30B2);
const _kRadius = 15.0;

class PatientProfile extends StatefulWidget {
  const PatientProfile({super.key});
  @override
  State<PatientProfile> createState() => _PatientProfileState();
}

class _PatientProfileState extends State<PatientProfile> {
  final _name = TextEditingController(text: 'Shubham');
  final _phone = TextEditingController(text: '0135792468');
  final _age = TextEditingController(text: '14');
  final _address = TextEditingController();
  final _email = TextEditingController(text: 'abc@gmail.com');
  final _password = TextEditingController(text: 'abc@xyz123');

  String _gender = 'Male';
  String _role = 'Patient';

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _age.dispose();
    _address.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final isVerySmall = w < 340;
    final horizontal = isVerySmall ? 12.0 : 16.0;
    final smallGap = isVerySmall ? 6.0 : 8.0;
    final sectionGap = isVerySmall ? 12.0 : 16.0;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: _kPrimary,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          onPressed: () => Navigator.maybePop(context),
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: Colors.white,
            size: 18,
          ),
        ),
        title: const Text(
          'Profile',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(_kRadius),
          ),
        ),
      ),
      body: SafeArea(
        child: AnimatedPadding(
          duration: const Duration(milliseconds: 150),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(
              horizontal,
              sectionGap,
              horizontal,
              sectionGap,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: _buildForm(smallGap, sectionGap),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildForm(double smallGap, double sectionGap) {
    const underline = UnderlineInputBorder(
      borderSide: BorderSide(color: Color(0xFFBDBDBD), width: 1),
    );
    InputDecoration deco({Widget? suffix}) => const InputDecoration(
      isDense: true,
      enabledBorder: underline,
      focusedBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: _kPrimary, width: 1.6),
      ),
      contentPadding: EdgeInsets.symmetric(vertical: 10),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Center(
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: 108,
                height: 108,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.black26),
                ),
              ),
              Positioned(
                right: 6,
                bottom: 6,
                child: Container(
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(3),
                    child: Icon(Icons.edit, size: 18, color: Colors.black87),
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: sectionGap),

        _Label('Full name*'),
        TextField(controller: _name, decoration: deco()),
        SizedBox(height: smallGap),

        _Label('Phone No.*'),
        TextField(
          controller: _phone,
          keyboardType: TextInputType.phone,
          decoration: deco(),
        ),
        SizedBox(height: smallGap),

        _Label('Age*'),
        SizedBox(
          width: 120,
          child: TextField(
            controller: _age,
            keyboardType: TextInputType.number,
            decoration: deco(),
          ),
        ),
        SizedBox(height: smallGap),

        _Label('Gender*'),
        const SizedBox(height: 6),
        Wrap(
          spacing: 18,
          children: [
            _RadioDot(
              selected: _gender == 'Male',
              label: 'Male',
              onTap: () => setState(() => _gender = 'Male'),
            ),
            _RadioDot(
              selected: _gender == 'Female',
              label: 'Female',
              onTap: () => setState(() => _gender = 'Female'),
              unselectedDotColor: Colors.black26,
            ),
          ],
        ),
        SizedBox(height: sectionGap),

        _Label('Role*'),
        const SizedBox(height: 6),
        Wrap(
          spacing: 18,
          children: [
            _RadioDot(
              selected: _role == 'Patient',
              label: 'Patient',
              onTap: () => setState(() => _role = 'Patient'),
            ),
            _RadioDot(
              selected: _role == 'Doctor',
              label: 'Doctor',
              onTap: () => setState(() => _role = 'Doctor'),
              unselectedDotColor: Colors.black26,
            ),
          ],
        ),
        SizedBox(height: sectionGap),

        _Label('Address*'),
        TextField(controller: _address, decoration: deco()),
        SizedBox(height: sectionGap),

        _Label('Set Location*'),
        TextField(
          decoration: deco(
            suffix: const Icon(Icons.location_pin, color: Colors.black87),
          ),
        ),
        SizedBox(height: sectionGap),

        _Label('Email*'),
        TextField(
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          decoration: deco(),
        ),
        SizedBox(height: sectionGap),

        _Label('Password*'),
        TextField(
          controller: _password,
          obscureText: true,
          decoration: deco(suffix: const Icon(Icons.visibility_off)),
        ),
        SizedBox(height: sectionGap),

        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: _kPrimary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(_kRadius),
              ),
              textStyle: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            child: const Text('Save'),
          ),
        ),
      ],
    );
  }
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(
      text,
      style: const TextStyle(fontSize: 16, color: Colors.black87),
    ),
  );
}

class _RadioDot extends StatelessWidget {
  final bool selected;
  final String label;
  final VoidCallback onTap;
  final Color unselectedDotColor;
  const _RadioDot({
    required this.selected,
    required this.label,
    required this.onTap,
    this.unselectedDotColor = Colors.black54,
  });
  @override
  Widget build(BuildContext context) {
    final icon = selected ? Icons.circle : Icons.circle_outlined;
    final color = selected ? Colors.black : unselectedDotColor;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(fontSize: 16)),
        ],
      ),
    );
  }
}
