import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:docgo/features/consultation/api/consultation_api.dart';

class ConsultProvider extends ChangeNotifier {
  final ConsultApi api;
  Timer? _consultationTimer;
  Timer? _notificationTimer;
  final Map<String, Timer> _consultationTimers = {};

  ConsultProvider({required this.api}) {
    // Setup timer untuk auto-refresh ketika provider diinisialisasi
    _setupAutoRefresh();
  }

  /// =========================
  /// STATE
  /// =========================
  bool isLoading = false;
  bool hasError = false;
  String errorMessage = '';
  String? lastBookingMessage;

  List<dynamic> consultations = [];
  List<dynamic> doctorConsultations = [];
  Map<String, dynamic> chatMessages = {};
  Map<String, dynamic> patientSummaries = {};
  Map<String, Map<String, List<Map<String, dynamic>>>> doctorSchedules = {};

  // ======= Doctor List =======
  List<dynamic> doctorsList = [];

  /// =========================
  /// SETUP AUTO REFRESH
  /// =========================
  void _setupAutoRefresh() {
    // Setup timer untuk refresh data konsultasi setiap 30 detik
    _consultationTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      _checkAndRefreshConsultations();
    });

    // Setup timer untuk check notifikasi setiap menit
    _notificationTimer = Timer.periodic(const Duration(minutes: 1), (timer) {
      _checkConsultationStartTimes();
    });
  }

  void _checkAndRefreshConsultations() async {
    try {
      final hasActiveConsultations = consultations.any((consult) {
        final scheduledAt = DateTime.tryParse(
          consult['scheduledAt']?.toString() ?? '',
        );
        final status = consult['status']?.toString().toUpperCase();
        
        if (scheduledAt == null) return false;
        if (status != 'PENDING' && status != 'ONGOING') return false;
        
        final endTime = scheduledAt.add(const Duration(minutes: 30));
        final now = DateTime.now();
        return now.isBefore(endTime);
      });

      if (hasActiveConsultations) {
        await fetchUserConsultations();
      }
    } catch (e) {
      print('Error in auto-refresh: $e');
    }
  }

  void _checkConsultationStartTimes() {
    final now = DateTime.now();
    
    for (final consult in consultations) {
      final scheduledAt = DateTime.tryParse(
        consult['scheduledAt']?.toString() ?? '',
      );
      final status = consult['status']?.toString().toUpperCase();
      final consultId = consult['id']?.toString() ?? consult['_id']?.toString();
      
      if (scheduledAt == null || status != 'PENDING' || consultId == null) continue;
      
      // Jika sudah waktunya mulai (5 menit sebelum)
      final canStartTime = scheduledAt.subtract(const Duration(minutes: 5));
      if (now.isAfter(canStartTime) && now.isBefore(scheduledAt)) {
        // Update status menjadi ONGOING
        _updateLocalConsultationStatus(consultId, 'ONGOING');
        notifyListeners();
        
        // Trigger snackbar jika perlu
        if (onConsultationStarted != null) {
          onConsultationStarted!(consult);
        }
      }
    }
  }

  // Callback untuk UI
  Function(Map<String, dynamic>)? onConsultationStarted;

  void _updateLocalConsultationStatus(String id, String status) {
    final index = consultations.indexWhere((c) => 
      (c['id'] == id) || (c['_id'] == id)
    );
    if (index != -1) {
      consultations[index]['status'] = status;
    }
  }

  /// =========================
  /// RESET STATE
  /// =========================
  void resetState() {
    isLoading = false;
    hasError = false;
    errorMessage = '';
    notifyListeners();
  }

  void clearError() {
    hasError = false;
    errorMessage = '';
  }

  void setLoading(bool loading) {
    isLoading = loading;
    notifyListeners();
  }

  /// =========================
  /// FETCH CONSULTATIONS (FOR BOTH USER AND DOCTOR)
  /// =========================
  Future<void> fetchUserConsultations() async {
    try {
      isLoading = true;
      hasError = false;
      notifyListeners();

      final result = await api.getUserConsultations();
      if (result['success'] == true) {
        consultations = result['data'] ?? [];
        hasError = false;
        lastBookingMessage = null;
        
        // Setup timer untuk setiap konsultasi baru
        _setupTimersForConsultations();
      } else {
        hasError = true;
        errorMessage = result['message'] ?? 'Failed to fetch consultations';
      }
    } catch (e) {
      hasError = true;
      errorMessage = 'Connection error: ${e.toString()}';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void _setupTimersForConsultations() {
    for (var timer in _consultationTimers.values) {
      timer.cancel();
    }
    _consultationTimers.clear();

    final now = DateTime.now();
    
    for (final consult in consultations) {
      final scheduledAt = DateTime.tryParse(
        consult['scheduledAt']?.toString() ?? '',
      );
      final status = consult['status']?.toString().toUpperCase();
      final consultId = consult['id']?.toString() ?? consult['_id']?.toString();
      
      if (scheduledAt == null || consultId == null) continue;
      
      if (status == 'PENDING') {
        // Timer untuk mulai (5 menit sebelum)
        final timeUntilStart = scheduledAt.difference(now);
        final delayForStart = timeUntilStart - const Duration(minutes: 5);
        
        if (delayForStart > Duration.zero) {
          final timer = Timer(delayForStart, () {
            _updateLocalConsultationStatus(consultId, 'ONGOING');
            notifyListeners();
          });
          _consultationTimers[consultId] = timer;
        }
        
        // Timer untuk selesai (30 menit setelah)
        final endTime = scheduledAt.add(const Duration(minutes: 30));
        final timeUntilEnd = endTime.difference(now);
        
        if (timeUntilEnd > Duration.zero) {
          final timer = Timer(timeUntilEnd, () {
            _updateLocalConsultationStatus(consultId, 'COMPLETED');
            notifyListeners();
          });
          _consultationTimers['${consultId}_end'] = timer;
        }
      }
    }
  }

  /// =========================
  /// FETCH DOCTORS LIST
  /// =========================
  Future<void> fetchDoctorsList() async {
    try {
      isLoading = true;
      hasError = false;
      notifyListeners();

      final result = await api.getDoctorsList();
      if (result['success'] == true) {
        doctorsList = result['data'] ?? [];
        hasError = false;
      } else {
        hasError = true;
        errorMessage = result['message'] ?? 'Failed to fetch doctors';
      }
    } catch (e) {
      hasError = true;
      errorMessage = 'Connection error: ${e.toString()}';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchDoctorConsultations(String doctorId) async {
    try {
      isLoading = true;
      hasError = false;
      notifyListeners();

      final result = await api.getDoctorConsultations();
      if (result['success'] == true) {
        doctorConsultations = result['data'] ?? [];
        hasError = false;
      } else {
        hasError = true;
        errorMessage =
            result['message'] ?? 'Failed to fetch doctor consultations';
      }
    } catch (e) {
      hasError = true;
      errorMessage = 'Connection error: ${e.toString()}';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// =========================
  /// FETCH DOCTOR SCHEDULE
  /// =========================
  Future<void> fetchDoctorSchedule(String doctorId) async {
    try {
      isLoading = true;
      notifyListeners();

      final result = await api.getDoctorSchedule(doctorId);

      if (result['success'] == true) {
        final data = result['data'];
        if (data != null && data is Map<String, dynamic>) {
          final bookedSlots = data['bookedSlots'];
          doctorSchedules[doctorId] = {
            'today': List<Map<String, dynamic>>.from(
              bookedSlots?['today'] ?? [],
            ),
            'tomorrow': List<Map<String, dynamic>>.from(
              bookedSlots?['tomorrow'] ?? [],
            ),
          };
        } else {
          doctorSchedules[doctorId] = {'today': [], 'tomorrow': []};
        }
      } else {
        doctorSchedules[doctorId] = {'today': [], 'tomorrow': []};
      }
    } catch (e) {
      doctorSchedules[doctorId] = {'today': [], 'tomorrow': []};
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// =========================
  /// CREATE CONSULTATION WITH AUTO REFRESH - FIXED VERSION
  /// =========================
  Future<bool> createConsultation({
  required String doctorId,
  required String type,
  required DateTime scheduledAt,
  required int duration,
}) async {
  try {
    print('═══════════════════════════════════════════');
    print('🔵 [Provider] START createConsultation');
    print('🔵 [Provider] doctorId: $doctorId');
    print('🔵 [Provider] type: $type');
    print('🔵 [Provider] scheduledAt: $scheduledAt');
    print('🔵 [Provider] duration: $duration');
    print('🔵 [Provider] api instance: ${api != null ? "OK" : "NULL"}');
    
    isLoading = true;
    hasError = false;
    notifyListeners();

    print('🔵 [Provider] Calling api.createConsultation()...');
    final result = await api.createConsultation(
      doctorId: doctorId,
      type: type,
      scheduledAt: scheduledAt,
      duration: duration,
    );

    print('🟢 [Provider] API Response received');
    print('🟢 [Provider] Response keys: ${result.keys}');
    print('🟢 [Provider] success: ${result['success']}');
    print('🟢 [Provider] message: ${result['message']}');
    print('🟢 [Provider] data: ${result['data']}');

    if (result['success'] == true) {
      print('✅ [Provider] Booking berhasil di backend');
      
      if (result['data'] != null) {
        final newConsultation = result['data']['consultation'] ?? result['data'];
        print('📦 [Provider] New consultation: ${jsonEncode(newConsultation)}');
        
        // Tambahkan ke list local
        consultations.insert(0, newConsultation);
      }

      lastBookingMessage = 'Booking berhasil! Chat akan tersedia 5 menit sebelum konsultasi dimulai.';
      
      // Immediately refresh to get latest data dengan chat room
      print('🔄 [Provider] Refreshing consultations...');
      await fetchUserConsultations();
      
      // Setup timer untuk konsultasi ini
      _setupTimerForConsultation(doctorId, scheduledAt, duration);
      
      print('🎉 [Provider] END - Success');
      print('═══════════════════════════════════════════');
      return true;
    } else {
      hasError = true;
      errorMessage = result['message'] ?? 'Failed to create consultation';
      lastBookingMessage = null;
      
      print('❌ [Provider] Error dari API: $errorMessage');
      print('═══════════════════════════════════════════');
      return false;
    }
  } catch (e, stack) {
    hasError = true;
    errorMessage = 'Connection error: ${e.toString()}';
    lastBookingMessage = null;
    
    print('🔥 [Provider] Exception: $e');
    print('🔥 [Provider] Stack trace: $stack');
    print('═══════════════════════════════════════════');
    return false;
  } finally {
    isLoading = false;
    notifyListeners();
  }
}
  void _setupTimerForConsultation(String doctorId, DateTime scheduledAt, int duration) {
    try {
      print('⏰ [Provider] Setting up timer for consultation');
      print('⏰ [Provider] doctorId: $doctorId');
      print('⏰ [Provider] scheduledAt: $scheduledAt');
      print('⏰ [Provider] duration: $duration');
      
      final now = DateTime.now();
      print('⏰ [Provider] Now: $now');
      
      // Cari consultation yang baru dibuat
      final matchingConsultations = consultations.where((c) {
        final consultDoctorId = c['doctorId'] ?? c['doctor']?['id'];
        final consultScheduledAtStr = c['scheduledAt']?.toString();
        
        if (consultDoctorId == null || consultScheduledAtStr == null) return false;
        
        final consultScheduledAt = DateTime.tryParse(consultScheduledAtStr);
        if (consultScheduledAt == null) return false;
        
        print('⏰ [Provider] Checking consultation:');
        print('⏰ [Provider] - doctorId: $consultDoctorId');
        print('⏰ [Provider] - scheduledAt: $consultScheduledAt');
        
        return consultDoctorId.toString() == doctorId && 
               consultScheduledAt.isAtSameMomentAs(scheduledAt);
      }).toList();

      if (matchingConsultations.isEmpty) {
        print('⚠️ [Provider] Tidak ditemukan consultation yang cocok');
        return;
      }

      final consultation = matchingConsultations.first;
      final consultId = consultation['id']?.toString() ?? consultation['_id']?.toString();
      
      if (consultId == null) {
        print('⚠️ [Provider] Consultation ID null');
        return;
      }

      print('⏰ [Provider] Found consultation with ID: $consultId');

      // Timer untuk mulai (5 menit sebelum)
      final timeUntilStart = scheduledAt.difference(now);
      final delayForStart = timeUntilStart - const Duration(minutes: 5);
      
      print('⏰ [Provider] Time until start: $timeUntilStart');
      print('⏰ [Provider] Delay for start (5 min before): $delayForStart');
      
      if (delayForStart > Duration.zero) {
        print('⏰ [Provider] Setting start timer for $delayForStart');
        final timer = Timer(delayForStart, () {
          print('🎬 [Provider] Timer triggered - Changing status to ONGOING');
          _updateLocalConsultationStatus(consultId, 'ONGOING');
          notifyListeners();
        });
        _consultationTimers[consultId] = timer;
      } else {
        print('⏰ [Provider] Start time sudah lewat atau kurang dari 5 menit');
      }
      
      // Timer untuk selesai
      final endTime = scheduledAt.add(Duration(minutes: duration));
      final timeUntilEnd = endTime.difference(now);
      
      print('⏰ [Provider] End time: $endTime');
      print('⏰ [Provider] Time until end: $timeUntilEnd');
      
      if (timeUntilEnd > Duration.zero) {
        print('⏰ [Provider] Setting end timer for $timeUntilEnd');
        final timer = Timer(timeUntilEnd, () {
          print('✅ [Provider] Timer triggered - Changing status to COMPLETED');
          _updateLocalConsultationStatus(consultId, 'COMPLETED');
          notifyListeners();
        });
        _consultationTimers['${consultId}_end'] = timer;
      } else {
        print('⏰ [Provider] End time sudah lewat');
      }
      
    } catch (e) {
      print('🔥 [Provider] Error in _setupTimerForConsultation: $e');
    }
  }

  Future<bool> updateConsultationStatus(String id, String status) async {
    try {
      isLoading = true;
      hasError = false;
      notifyListeners();

      final result = await api.updateConsultationStatus(
        consultationId: id,
        status: status,
      );

      if (result['success'] == true) {
        // Update local data
        final userIndex = consultations.indexWhere((c) => c['id'] == id);
        if (userIndex != -1) {
          consultations[userIndex]['status'] = status;
        }

        final doctorIndex = doctorConsultations.indexWhere(
          (c) => c['id'] == id,
        );
        if (doctorIndex != -1) {
          doctorConsultations[doctorIndex]['status'] = status;
        }

        return true;
      } else {
        hasError = true;
        errorMessage = result['message'] ?? 'Failed to update status';
        return false;
      }
    } catch (e) {
      hasError = true;
      errorMessage = 'Connection error: ${e.toString()}';
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// =========================
  /// CHAT RELATED METHODS
  /// =========================
  Future<bool> sendMessage({
    required String chatRoomId,
    required String senderType,
    required String senderId,
    required String content,
    String type = "TEXT",
  }) async {
    try {
      final result = await api.sendMessage(
        chatRoomId: chatRoomId,
        senderType: senderType,
        senderId: senderId,
        content: content,
        type: type,
      );

      if (result['success'] == true) {
        chatMessages.putIfAbsent(chatRoomId, () => []);
        chatMessages[chatRoomId]!.add(result['data']);
        notifyListeners();
        return true;
      } else {
        hasError = true;
        errorMessage = result['message'] ?? 'Failed to send message';
        notifyListeners();
        return false;
      }
    } catch (e) {
      hasError = true;
      errorMessage = 'Connection error: ${e.toString()}';
      notifyListeners();
      return false;
    }
  }

  Future<void> fetchMessages(String chatRoomId) async {
    try {
      isLoading = true;
      hasError = false;
      notifyListeners();

      final result = await api.getMessages(chatRoomId);
      if (result['success'] == true) {
        chatMessages[chatRoomId] = result['data'] ?? [];
        hasError = false;
      } else {
        hasError = true;
        errorMessage = result['message'] ?? 'Failed to fetch messages';
      }
    } catch (e) {
      hasError = true;
      errorMessage = 'Connection error: ${e.toString()}';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// =========================
  /// UTILITY METHODS
  /// =========================
  bool hasConsultationToday() {
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    final todayEnd = todayStart.add(const Duration(days: 1));

    return consultations.any((c) {
      final scheduledAt = DateTime.tryParse(c['scheduledAt']?.toString() ?? '');
      if (scheduledAt == null) return false;
      return scheduledAt.isAfter(todayStart) && scheduledAt.isBefore(todayEnd);
    });
  }

  Map<String, dynamic>? getActiveConsultationForDoctor(String doctorId) {
    final now = DateTime.now();
    
    for (final consult in consultations) {
      final consultDoctorId = consult['doctorId'] ?? consult['doctor']?['id'];
      final scheduledAt = DateTime.tryParse(
        consult['scheduledAt']?.toString() ?? '',
      );
      final status = consult['status']?.toString().toUpperCase();

      if (consultDoctorId != doctorId || scheduledAt == null) continue;
      if (status != 'PENDING' && status != 'ONGOING') continue;

      final canStartTime = scheduledAt.subtract(const Duration(minutes: 5));
      final endTime = scheduledAt.add(const Duration(minutes: 30));

      if (now.isAfter(canStartTime) && now.isBefore(endTime)) {
        return consult;
      }
    }
    return null;
  }

  Map<String, dynamic>? getDoctorById(String doctorId) {
    try {
      return doctorsList.firstWhere(
        (doctor) => doctor['id'] == doctorId || doctor['_id'] == doctorId,
      );
    } catch (e) {
      return null;
    }
  }

  Map<String, dynamic>? getConsultationById(String consultationId) {
    try {
      final userConsultation = consultations.firstWhere(
        (c) => c['id'] == consultationId || c['_id'] == consultationId,
      );
      return userConsultation;
    } catch (e) {
      try {
        final doctorConsultation = doctorConsultations.firstWhere(
          (c) => c['id'] == consultationId || c['_id'] == consultationId,
        );
        return doctorConsultation;
      } catch (e) {
        return null;
      }
    }
  }

  List<Map<String, dynamic>> getTodayConsultations() {
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    final todayEnd = todayStart.add(const Duration(days: 1));

    return consultations.where((c) {
      final scheduledAt = DateTime.tryParse(c['scheduledAt']?.toString() ?? '');
      if (scheduledAt == null) return false;
      return scheduledAt.isAfter(todayStart) && scheduledAt.isBefore(todayEnd);
    }).map((c) => c as Map<String, dynamic>).toList();
  }

  /// =========================
  /// DISPOSE
  /// =========================
  @override
  void dispose() {
    _consultationTimer?.cancel();
    _notificationTimer?.cancel();
    for (var timer in _consultationTimers.values) {
      timer.cancel();
    }
    super.dispose();
  }
}