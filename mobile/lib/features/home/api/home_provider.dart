import 'package:flutter/material.dart';
import '../api/home_api.dart';

class HomeProvider extends ChangeNotifier {
  final HomeApi api;

  HomeProvider({required this.api});

  // Profile
  String fullName = '';
  String email = '';

  // Video
  List<Map<String, dynamic>> videos = [];

  // Status
  bool isLoading = false;
  bool hasError = false;
  String errorMessage = '';

  /// Fetch profile dan video sekaligus
  Future<void> fetchHomeData() async {
    isLoading = true;
    hasError = false;
    errorMessage = '';
    notifyListeners();

    try {
      // --- Profile ---
      final profileResult = await api.getProfile();
      if (profileResult['success'] == true) {
        final rawData = profileResult['rawData'] ?? {};
        final data = rawData['data'] ?? {}; // <-- ambil nested 'data'
        fullName = data['fullName'] ?? '';
        email = data['email'] ?? '';
      } else {
        hasError = true;
        errorMessage = profileResult['message'] ?? 'Failed to fetch profile';
      }

      final videoResult = await api.ScrapeYt();
if (videoResult['success'] == true) {
  videos = List<Map<String, dynamic>>.from(videoResult['videos']);
} else {
  hasError = true;
  errorMessage = videoResult['message'] ?? 'Failed to fetch videos';
}

    } catch (e) {
      hasError = true;
      errorMessage = e.toString();
    }

    isLoading = false;
    notifyListeners();
  }
}
