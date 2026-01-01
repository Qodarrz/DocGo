import 'package:docgo/network/api_client.dart';
import 'package:docgo/network/api_urls.dart';

class ReminderApi {
  /// GET /reminder
  Future<Map<String, dynamic>> fetchReminders() async {
    try {
      final response = await ApiClient.get(ApiUrls.reminders);
      if (response['success'] == true) {
        final data = List<Map<String, dynamic>>.from(response['data'] ?? []);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': response['message'] ?? 'Failed to fetch reminders'};
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// GET /reminders/by-date?date=YYYY-MM-DD
  Future<Map<String, dynamic>> fetchRemindersByDate(String date) async {
    try {
      final response = await ApiClient.get('${ApiUrls.reminders}/by-date?date=$date');
      if (response['success'] == true) {
        final data = List<Map<String, dynamic>>.from(response['data'] ?? []);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': response['message'] ?? 'Failed to fetch reminders by date'};
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// POST /reminder
  Future<Map<String, dynamic>> createReminder(Map<String, dynamic> payload) async {
    try {
      final response = await ApiClient.post(ApiUrls.reminders, payload);
      if (response['success'] == true) return {'success': true};
      return {'success': false, 'message': response['message'] ?? 'Failed to create reminder'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// PUT /reminder/:id
  Future<Map<String, dynamic>> updateReminder(String id, Map<String, dynamic> payload) async {
    try {
      final response = await ApiClient.put('${ApiUrls.reminders}/$id', payload);
      if (response['success'] == true) return {'success': true};
      return {'success': false, 'message': response['message'] ?? 'Failed to update reminder'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  /// DELETE /reminder/:id
  Future<Map<String, dynamic>> deleteReminder(String id) async {
    try {
      final response = await ApiClient.delete('${ApiUrls.reminders}/$id');
      if (response['success'] == true) return {'success': true};
      return {'success': false, 'message': response['message'] ?? 'Failed to delete reminder'};
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
