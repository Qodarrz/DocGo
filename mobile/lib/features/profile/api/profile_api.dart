import 'package:docgo/network/api_client.dart';
import 'package:docgo/network/api_urls.dart';

class ProfileApi {
  /// =========================
  /// GET /users/me
  /// =========================
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await ApiClient.get(ApiUrls.getProfile);
      print('GET PROFILE RESPONSE: $response');

      if (response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to fetch profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// =========================
  /// PATCH /users/me
  /// =========================
  Future<Map<String, dynamic>> updateProfile({
    required String fullName,
    String? phone,
    String? dateOfBirth,
    String? gender,
  }) async {
    try {
      final body = {
        'fullName': fullName,
        if (phone != null) 'phone': phone,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
        if (gender != null) 'gender': gender,
      };

      final response = await ApiClient.patch(
        ApiUrls.updateProfile,
        body,
      );

      print('UPDATE PROFILE RESPONSE: $response');

      if (response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
          'message': response['message'],
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to update profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// =========================
  /// UPSERT medical profile
  /// =========================
  Future<Map<String, dynamic>> upsertMedicalProfile({
    int? heightCm,
    int? weightKg,
    String? bloodType,
    List<Map<String, dynamic>>? allergies,
    List<Map<String, dynamic>>? medications,
  }) async {
    try {
      final body = {
        if (heightCm != null) 'heightCm': heightCm,
        if (weightKg != null) 'weightKg': weightKg,
        if (bloodType != null) 'bloodType': bloodType,
        if (allergies != null) 'allergies': allergies,
        if (medications != null) 'medications': medications,
      };

      final response = await ApiClient.post(
        ApiUrls.upsertMedicalProfile,
        body,
      );

      print('UPSERT MEDICAL PROFILE RESPONSE: $response');

      if (response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to save medical profile',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}
