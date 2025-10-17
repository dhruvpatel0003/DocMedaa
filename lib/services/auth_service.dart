
import 'dart:async';


class AuthService {
// Simulate a network delay
Future<void> _delay() => Future.delayed(const Duration(milliseconds: 900));


Future<bool> login({required String email, required String password}) async {
await _delay();
// TODO: Replace with real backend call
return email.isNotEmpty && password.isNotEmpty;
}


Future<bool> signUp({
required String fullName,
required String email,
required String password,
}) async {
await _delay();
return fullName.isNotEmpty && email.isNotEmpty && password.length >= 8;
}


Future<void> sendResetEmail({required String email}) async {
await _delay();
}


Future<void> resendResetEmail({required String email}) async {
await _delay();
}


Future<bool> resetPassword({
required String email,
required String token,
required String newPassword,
}) async {
await _delay();
return newPassword.length >= 8 && token.isNotEmpty && email.isNotEmpty;
}
}
