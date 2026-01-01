import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:docgo/network/api_urls.dart';

class ApiClient {
  static String get baseUrl => ApiUrls.baseUrl;

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    print('TOKEN FROM PREFS: $token'); // << ini harus ada nilainya

    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static Future<Map<String, dynamic>> _handleRequest(
    Future<http.Response> Function() request,
  ) async {
    try {
      final response = await request();
      final responseBody = json.decode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'data': responseBody,
          'statusCode': response.statusCode,
        };
      } else {
        return {
          'success': false,
          'message': responseBody['message'] ?? 'Something went wrong',
          'statusCode': response.statusCode,
          'data': responseBody,
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Connection failed. Please check your internet.',
        'statusCode': 0,
      };
    }
  }

  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    return await _handleRequest(() async {
      final url = Uri.parse('$baseUrl/$endpoint');
      final headers = await _getHeaders();
      return await http.post(url, headers: headers, body: json.encode(data));
    });
  }

  static Future<Map<String, dynamic>> get(String endpoint) async {
    return await _handleRequest(() async {
      final url = Uri.parse('$baseUrl/$endpoint');
      final headers = await _getHeaders();
      return await http.get(url, headers: headers);
    });
  }

  static Future<Map<String, dynamic>> put(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    return await _handleRequest(() async {
      final url = Uri.parse('$baseUrl/$endpoint');
      final headers = await _getHeaders();
      return await http.put(url, headers: headers, body: json.encode(data));
    });
  }

  static Future<Map<String, dynamic>> patch(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    return await _handleRequest(() async {
      final url = Uri.parse('$baseUrl/$endpoint');
      final headers = await _getHeaders();
      return await http.patch(url, headers: headers, body: json.encode(data));
    });
  }

  static Future<Map<String, dynamic>> delete(String endpoint) async {
    return await _handleRequest(() async {
      final url = Uri.parse('$baseUrl/$endpoint');
      final headers = await _getHeaders();
      return await http.delete(url, headers: headers);
    });
  }
}
