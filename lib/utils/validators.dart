
class Validators {
static String? notEmpty(String? v, {String field = 'This field'}) {
if (v == null || v.trim().isEmpty) return '$field is required';
return null;
}


static String? email(String? v) {
final basic = notEmpty(v, field: 'Email');
if (basic != null) return basic;
final regex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
if (!regex.hasMatch(v!.trim())) return 'Enter a valid email address';
return null;
}


static String? password(String? v) {
final basic = notEmpty(v, field: 'Password');
if (basic != null) return basic;
if (v!.length < 8) return 'Password must be at least 8 characters';
return null;
}
}
