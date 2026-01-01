import 'package:docgo/network/api_client.dart';
import 'package:docgo/network/api_urls.dart';

class AuthApi {
  // Login dengan email dan password
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await ApiClient.post(ApiUrls.login, {
      'email': email,
      'password': password,
    });

    // Handle response dari backend
    if (response['success'] == true) {
      final data = response['data'];

      // Cek jika email belum diverifikasi
      if (response['statusCode'] == 403 && data['needsVerification'] == true) {
        return {
          'success': false,
          'needsVerification': true,
          'message': data['message'],
          'email': data['email'],
        };
      }

      return {
        'success': true,
        'token': data['token'],
        'user': data['user'],
        'message': data['message'],
      };
    } else {
      return response;
    }
  }

  Future<Map<String, dynamic>> registerDeviceToken(
    String userId,
    String fcmToken,
    String authToken,
  ) async {
    print('Registering FCM token: userId=$userId, fcmToken=$fcmToken');
    final response = await ApiClient.post(
      ApiUrls.registerDeviceToken,
      {'userId': userId, 'fcmToken': fcmToken},
    );
    print('registerDeviceToken response: $response');
    return response;
  }

  // Register user baru
  Future<Map<String, dynamic>> register(String email, String password) async {
    final response = await ApiClient.post(ApiUrls.register, {
      'email': email,
      'password': password,
    });

    if (response['success'] == true) {
      final data = response['data'];
      return {
        'success': true,
        'token': data['token'],
        'user': data['user'],
        'message': data['message'],
        'emailSent': data['emailSent'] ?? false,
      };
    } else {
      return response;
    }
  }

  // Verifikasi email dengan OTP
  Future<Map<String, dynamic>> verifyEmail(String email, String otp) async {
    final response = await ApiClient.post(ApiUrls.verifyEmail, {
      'email': email,
      'otp': otp,
    });

    return response;
  }

  // Kirim ulang OTP
  Future<Map<String, dynamic>> resendOtp(String email) async {
    final response = await ApiClient.post(ApiUrls.resendOtp, {'email': email});

    return response;
  }

  // Lupa password - request reset
  Future<Map<String, dynamic>> forgotPassword(String email) async {
    final response = await ApiClient.post(ApiUrls.forgotPassword, {
      'email': email,
    });

    return response;
  }

  // Reset password dengan token
  Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final response = await ApiClient.post(ApiUrls.resetPassword, {
      'token': token,
      'newPassword': newPassword,
      'confirmPassword': confirmPassword,
    });

    return response;
  }

  // Cek validitas reset token
  Future<Map<String, dynamic>> checkResetToken(String token) async {
    final response = await ApiClient.get('${ApiUrls.checkResetToken}$token');

    return response;
  }
}
