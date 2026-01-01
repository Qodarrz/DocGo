import 'dart:convert';
import 'package:docgo/network/api_client.dart';
import 'package:docgo/network/api_urls.dart';
import 'package:http/http.dart' as http;

class ConsultApi {
  final String baseUrl;
  final http.Client client;

  ConsultApi({required this.baseUrl, required this.client});

  Future<Map<String, dynamic>> getUserConsultations() async {
    try {
      final response = await ApiClient.get(ApiUrls.getUserConsultations);
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// CREATE consultation - FIXED VERSION
  Future<Map<String, dynamic>> createConsultation({
    required String doctorId,
    required String type,
    required DateTime scheduledAt,
    required int duration,
  }) async {
    try {
      print('═══════════════════════════════════════════');
      print('🌐 [API] START createConsultation');
      print('🌐 [API] doctorId: $doctorId');
      print('🌐 [API] type: $type');
      print('🌐 [API] scheduledAt: $scheduledAt');
      print('🌐 [API] duration: $duration');

      // Format ke ISO 8601 UTC
      final isoDate = scheduledAt.toUtc().toIso8601String();
      print('🌐 [API] ISO Date: $isoDate');

      final body = {
        'doctorId': doctorId,
        'type': type,
        'scheduledAt': isoDate,
        'duration': duration,
      };

      print('🌐 [API] Request Body: ${jsonEncode(body)}');
      
      // Menggunakan ApiClient yang sudah handle token otomatis
      print('🌐 [API] Calling ApiClient.post...');
      
      // Pastikan endpoint benar: '/consultations' atau '/consultation'
      // Cek di ApiUrls.dart endpoint apa yang benar
      final response = await ApiClient.post(
        ApiUrls.createConsultation, // atau ApiUrls.createConsultation jika ada
        body,
      );

      print('🌐 [API] Response received');
      print('🌐 [API] Response success: ${response['success']}');
      print('🌐 [API] Response statusCode: ${response['statusCode']}');
      print('🌐 [API] Response message: ${response['message']}');
      print('🌐 [API] Response data: ${response['data']}');

      if (response['success'] == true) {
        print('🌐 [API] SUCCESS');
        print('═══════════════════════════════════════════');
        return {'success': true, 'data': response['data']};
      } else {
        print('🌐 [API] ERROR');
        print('═══════════════════════════════════════════');
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to create consultation',
        };
      }
    } catch (e, stack) {
      print('🔥 [API] EXCEPTION: $e');
      print('🔥 [API] STACK TRACE: $stack');
      print('═══════════════════════════════════════════');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// UPDATE consultation status
  Future<Map<String, dynamic>> updateConsultationStatus({
    required String consultationId,
    required String status,
  }) async {
    try {
      final response = await ApiClient.patch(
        '${ApiUrls.updateConsultationStatus}/$consultationId/status',
        {'status': status},
      );
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// GET doctor consultations
  Future<Map<String, dynamic>> getDoctorConsultations() async {
    try {
      final response = await ApiClient.get(ApiUrls.getDoctorConsultations);
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// GET doctors list
  Future<Map<String, dynamic>> getDoctorsList() async {
    try {
      final response = await ApiClient.get(ApiUrls.getDoctorsList);
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  // Di file ConsultApi
  Future<Map<String, dynamic>> getDoctorSchedule(String doctorId) async {
    try {
      final response = await ApiClient.get(
        '${ApiUrls.getDoctorSchedule}?doctorId=$doctorId',
      );
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// GET patient summary
  Future<Map<String, dynamic>> getPatientSummary(String consultationId) async {
    try {
      final response = await ApiClient.get(
        '${ApiUrls.getPatientSummary}/$consultationId/patient',
      );
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// SEND message
  Future<Map<String, dynamic>> sendMessage({
    required String chatRoomId,
    required String senderType,
    required String senderId,
    required String content,
    String type = "TEXT",
  }) async {
    try {
      final body = {
        'chatRoomId': chatRoomId,
        'senderType': senderType,
        'senderId': senderId,
        'content': content,
        'type': type,
      };
      final response = await ApiClient.post(ApiUrls.sendMessage, body);
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// GET chat messages
  Future<Map<String, dynamic>> getMessages(String chatRoomId) async {
    try {
      final response = await ApiClient.get(
        '${ApiUrls.getMessages}/$chatRoomId',
      );
      if (response['success'] == true)
        return {'success': true, 'data': response['data']};
      return {'success': false, 'message': response['message']};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}