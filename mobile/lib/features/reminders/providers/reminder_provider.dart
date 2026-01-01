import 'package:flutter/material.dart';
import 'package:docgo/features/reminders/api/reminder_api.dart';

class ReminderProvider extends ChangeNotifier {
  final ReminderApi _api = ReminderApi();

  List<Map<String, dynamic>> reminders = [];
  bool loading = false;

  // Load all reminders
  Future<void> loadReminders() async {
    loading = true;
    notifyListeners();

    final res = await _api.fetchReminders();

    if (res['success'] == true) {
      reminders = List<Map<String, dynamic>>.from(res['data'] ?? []);
    }

    loading = false;
    notifyListeners();
  }

  // Create a new reminder
  Future<void> createReminder(Map<String, dynamic> payload) async {
    final res = await _api.createReminder(payload);
    if (res['success'] == true) {
      await loadReminders();
    }
  }

  // Update an existing reminder
  Future<void> updateReminder(String id, Map<String, dynamic> payload) async {
    final res = await _api.updateReminder(id, payload);
    if (res['success'] == true) {
      await loadReminders();
    }
  }

  // Delete a reminder
  Future<void> deleteReminder(String id) async {
    final res = await _api.deleteReminder(id);
    if (res['success'] == true) {
      reminders.removeWhere((r) => r['id'].toString() == id);
      notifyListeners();
    }
  }

  // Fetch reminders by a specific date
  Future<void> fetchRemindersByDate(DateTime date) async {
    loading = true;
    notifyListeners();

    final formatted =
        "${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}";

    final res = await _api.fetchReminders(); // fetch all reminders

    if (res['success'] == true) {
      final allReminders = List<Map<String, dynamic>>.from(res['data'] ?? []);

      reminders = allReminders.where((r) {
        final startAt = DateTime.parse(r['startAt']).toLocal();
        final endAt = r['endAt'] != null
            ? DateTime.parse(r['endAt']).toLocal()
            : null;
        final repeatType = r['repeatType'] ?? 'ONCE';
        final isActive = r['isActive'] ?? true;

        if (!isActive) return false;
        if (startAt.isAfter(date.add(const Duration(days: 1)))) return false;
        if (endAt != null && endAt.isBefore(date)) return false;

        switch (repeatType) {
          case 'DAILY':
            return startAt.isBefore(date.add(const Duration(days: 1)));
          case 'WEEKLY':
            final difference = date.difference(startAt).inDays;
            return difference % 7 == 0 && difference >= 0;
          case 'MONTHLY':
            return startAt.day == date.day &&
                startAt.isBefore(date.add(const Duration(days: 1)));
          case 'ONCE':
          default:
            return startAt.year == date.year &&
                startAt.month == date.month &&
                startAt.day == date.day;
        }
      }).toList();
    } else {
      reminders = [];
    }

    loading = false;
    notifyListeners();
  }
}
