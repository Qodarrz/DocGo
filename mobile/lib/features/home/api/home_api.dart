import 'package:docgo/network/api_client.dart';
import 'package:docgo/network/api_urls.dart';

class HomeApi {
  /// Ambil data profile user
  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await ApiClient.get(ApiUrls.getProfile);
      // print('PROFILE RESPONSE: $response');

      if (response['success'] == true) {
        final data = response['data'];
        final fullName = data['fullName'] ?? '';
        final email = data['email'] ?? '';

        return {
          'success': true,
          'fullName': fullName,
          'email': email,
          'rawData': data,
        };
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to fetch profile',
        };
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> ScrapeYt() async {
    try {
      final response = await ApiClient.get(ApiUrls.scrapeYt);

      if (response['success'] == true) {
        final innerData = response['data'] ?? {};
        final videosList = List<Map<String, dynamic>>.from(
          innerData['data'] ?? [], // <- ambil list nested 'data'
        );

        return {'success': true, 'videos': videosList};
      } else {
        return {
          'success': false,
          'message': response['message'] ?? 'Failed to fetch videos',
        };
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }
}
      
