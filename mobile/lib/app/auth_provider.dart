import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:docgo/features/auth/api/auth_api.dart';
import 'package:docgo/service/notification_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthApi _authApi = AuthApi();

  String? _token;
  String? _userId;
  String? _userEmail;
  String? _userName;
  bool _isLoading = false;
  String? _errorMessage;

  // Email untuk verifikasi
  String? _pendingVerificationEmail;

  // ONBOARDING STATE
  bool _hasCompletedOnboarding = false;

  // =========================
  // GETTERS
  // =========================
  String? get token => _token;
  String? get userId => _userId;
  String? get userEmail => _userEmail;
  String? get userName => _userName;
  String? get pendingVerificationEmail => _pendingVerificationEmail;
  bool get isAuthenticated => _token != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  bool get hasCompletedOnboarding => _hasCompletedOnboarding;

  // =========================
  // HELPERS
  // =========================
  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void clearPendingVerification() {
    _pendingVerificationEmail = null;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    setLoading(true);
    _errorMessage = null;

    try {
      final response = await _authApi.login(email, password);

      if (response['success'] == true) {
        _token = response['token'];
        _userId = response['user']['id']?.toString();
        _userEmail = response['user']['email'];

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        await prefs.setString('userId', _userId!);
        await prefs.setString('userEmail', _userEmail!);

        final fcmToken = await PushNotificationService.getToken();
        if (fcmToken != null) {
          await _authApi.registerDeviceToken(_userId!, fcmToken, _token!);
        }

        PushNotificationService.listen();
        notifyListeners();
        return true;
      } else if (response['needsVerification'] == true ||
          (response['message']?.toLowerCase().contains('verifikasi') ??
              false)) {
        _pendingVerificationEmail = response['email'] ?? email;
        _errorMessage = response['message'];
        notifyListeners();
        return false;
      } else {
        _errorMessage = response['message'] ?? 'Login failed';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> register(String email, String password) async {
    setLoading(true);
    _errorMessage = null;

    try {
      final response = await _authApi.register(email, password);

      if (response['success'] == true) {
        _token = response['token'];
        _userId = response['user']['id']?.toString();
        _userEmail = response['user']['email'];
        _pendingVerificationEmail = email;

        if (_token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', _token!);
          await prefs.setString('userId', _userId!);
          await prefs.setString('userEmail', _userEmail!);
        }

        notifyListeners();
        return true;
      } else {
        _errorMessage = response['message'] ?? 'Registration failed';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> verifyEmail(String email, String otp) async {
    setLoading(true);
    _errorMessage = null;

    try {
      final response = await _authApi.verifyEmail(email, otp);

      if (response['success'] == true) {
        _pendingVerificationEmail = null;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response['message'] ?? 'Verification failed';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<bool> resendOtp(String email) async {
    setLoading(true);
    _errorMessage = null;

    try {
      final response = await _authApi.resendOtp(email);

      if (response['success'] == true) {
        notifyListeners();
        return true;
      } else {
        _errorMessage = response['message'] ?? 'Failed to resend OTP';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    } finally {
      setLoading(false);
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
    await prefs.remove('userEmail');

    _token = null;
    _userId = null;
    _userEmail = null;
    _pendingVerificationEmail = null;
    notifyListeners();
  }

  Future<void> checkOnboardingStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _hasCompletedOnboarding = prefs.getBool('hasCompletedOnboarding') ?? false;
    notifyListeners();
  }

  Future<void> completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('hasCompletedOnboarding', true);
    _hasCompletedOnboarding = true;
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _userId = prefs.getString('userId');
    _userEmail = prefs.getString('userEmail');
    notifyListeners();
  }
}
