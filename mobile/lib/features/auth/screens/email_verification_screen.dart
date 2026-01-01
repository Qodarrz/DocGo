import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:docgo/app/auth_provider.dart';
import 'package:docgo/app/routes.dart';
import 'package:docgo/features/auth/widgets/auth_header.dart';

class EmailVerificationScreen extends StatefulWidget {
  final String email;
  const EmailVerificationScreen({super.key, required this.email});

  @override
  State<EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final _otpControllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());

  @override
  void dispose() {
    for (final c in _otpControllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final otp = _otpControllers.map((e) => e.text).join();
    if (otp.length != 6) {
      _showError('Please enter the 6-digit code');
      return;
    }

    final auth = context.read<AuthProvider>();
    final success = await auth.verifyEmail(widget.email, otp);

    if (!mounted) return;

    if (success) {
      context.go(AppRoutes.home);
    } else {
      _showError(auth.errorMessage ?? 'Verification failed');
    }
  }

  Future<void> _resendOtp() async {
    final auth = context.read<AuthProvider>();
    final success = await auth.resendOtp(widget.email);

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OTP has been resent!'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      _showError(auth.errorMessage ?? 'Failed to resend code');
    }
  }

  void _onOtpChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) _focusNodes[index + 1].requestFocus();
    if (value.isEmpty && index > 0) _focusNodes[index - 1].requestFocus();

    final filled = _otpControllers.every((e) => e.text.isNotEmpty);
    if (filled) _verify();
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              IconButton(icon: const Icon(Icons.arrow_back_ios), onPressed: () => context.pop()),
              const SizedBox(height: 16),
              const AuthHeader(title: 'Verify Email', subtitle: 'Enter the 6-digit code sent to your email'),
              const SizedBox(height: 12),
              Text(widget.email, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 48,
                    height: 56,
                    child: TextField(
                      controller: _otpControllers[index],
                      focusNode: _focusNodes[index],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      decoration: InputDecoration(
                        counterText: '',
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onChanged: (v) => _onOtpChanged(index, v),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: auth.isLoading ? null : _verify,
                  child: auth.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Verify'),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: auth.isLoading ? null : _resendOtp,
                  child: const Text('Resend Code', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
