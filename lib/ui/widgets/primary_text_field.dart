
import 'package:flutter/material.dart';


class PrimaryTextField extends StatelessWidget {
final TextEditingController controller;
final String label;
final TextInputType keyboardType;
final bool obscureText;
final String? Function(String?)? validator;


const PrimaryTextField({
super.key,
required this.controller,
required this.label,
this.keyboardType = TextInputType.text,
this.obscureText = false,
this.validator,
});


@override
Widget build(BuildContext context) {
return TextFormField(
controller: controller,
keyboardType: keyboardType,
obscureText: obscureText,
validator: validator,
decoration: InputDecoration(
labelText: label,
),
);
}
}
