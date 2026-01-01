import 'package:flutter/material.dart';
import '../api/profile_api.dart';

class ProfileProvider extends ChangeNotifier {
  final ProfileApi api;

  ProfileProvider({required this.api});

  /// =========================
  /// BASIC USER DATA
  /// =========================
  String id = '';
  String fullName = '';
  String email = '';
  String userProfile = '';
  String? phone;
  DateTime? dateOfBirth;
  String? gender;

  /// =========================
  /// MEDICAL PROFILE
  /// =========================
  int? heightCm;
  int? weightKg;
  String? bloodType;
  List<Map<String, dynamic>> allergies = [];
  List<Map<String, dynamic>> medications = [];

  /// =========================
  /// STATE
  /// =========================
  bool isLoading = false;
  bool hasError = false;
  String errorMessage = '';

  /// =========================
  /// FETCH PROFILE
  /// =========================
  Future<void> fetchProfile() async {
    isLoading = true;
    hasError = false;
    errorMessage = '';
    notifyListeners();

    try {
      final result = await api.getProfile();
      print('GET PROFILE RESPONSE: $result');

      if (result['success'] == true) {
        final nested = result['data']['data'];

        id = nested['id'];
        fullName = nested['fullName'] ?? '';
        userProfile = nested['userProfile'] ?? '';
        email = nested['email'] ?? '';
        phone = nested['phone'];
        gender = nested['gender'];

        dateOfBirth = nested['dateOfBirth'] != null
            ? DateTime.parse(nested['dateOfBirth'])
            : null;

        final medical = nested['medicalProfile'];
        if (medical != null) {
          heightCm = medical['heightCm'];
          weightKg = medical['weightKg'];
          bloodType = medical['bloodType'];
          allergies = List<Map<String, dynamic>>.from(
            medical['allergies'] ?? [],
          );
          medications = List<Map<String, dynamic>>.from(
            medical['medications'] ?? [],
          );
        }
      } else {
        hasError = true;
        errorMessage = result['message'] ?? 'Failed to load profile';
      }
    } catch (e) {
      hasError = true;
      errorMessage = e.toString();
    }

    isLoading = false;
    notifyListeners();
  }

  /// =========================
  /// UPDATE BASIC PROFILE
  /// =========================
  Future<bool> updateProfile(Map<String, String> map, {
    required String newFullName,
    String? newPhone,
    DateTime? newDateOfBirth,
    String? newGender,
  }) async {
    isLoading = true;
    notifyListeners();

    final result = await api.updateProfile(
      fullName: newFullName,
      phone: newPhone,
      gender: newGender,
      dateOfBirth: newDateOfBirth != null
          ? newDateOfBirth.toIso8601String()
          : null,
    );

    isLoading = false;

    if (result['success'] == true) {
      fullName = newFullName;
      phone = newPhone;
      dateOfBirth = newDateOfBirth;
      gender = newGender;
      notifyListeners();
      return true;
    } else {
      hasError = true;
      errorMessage = result['message'] ?? 'Update failed';
      notifyListeners();
      return false;
    }
  }

  /// =========================
  /// UPDATE MEDICAL PROFILE
  /// =========================
  Future<bool> saveMedicalProfile({
    int? newHeightCm,
    int? newWeightKg,
    String? newBloodType,
    List<Map<String, dynamic>>? newAllergies,
    List<Map<String, dynamic>>? newMedications,
  }) async {
    isLoading = true;
    notifyListeners();

    final result = await api.upsertMedicalProfile(
      heightCm: newHeightCm,
      weightKg: newWeightKg,
      bloodType: newBloodType,
      allergies: newAllergies,
      medications: newMedications,
    );

    isLoading = false;

    if (result['success'] == true) {
      heightCm = newHeightCm;
      weightKg = newWeightKg;
      bloodType = newBloodType;
      allergies = newAllergies ?? allergies;
      medications = newMedications ?? medications;
      notifyListeners();
      return true;
    } else {
      hasError = true;
      errorMessage = result['message'] ?? 'Failed to save medical profile';
      notifyListeners();
      return false;
    }
  }
}
