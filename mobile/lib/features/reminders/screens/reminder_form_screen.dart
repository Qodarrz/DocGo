import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/reminder_provider.dart';

enum ReminderRepeatType { ONCE, DAILY, WEEKLY, MONTHLY, CUSTOM }

enum NotificationType {
  MEDICATION,
  HEALTH_ALERT,
  CONSULTATION,
  SYSTEM,
  REMINDER,
}

class ReminderFormScreen extends StatefulWidget {
  final Map<String, dynamic>? reminder;
  const ReminderFormScreen({super.key, this.reminder});

  @override
  State<ReminderFormScreen> createState() => _ReminderFormScreenState();
}

class _ReminderFormScreenState extends State<ReminderFormScreen> {
  late TextEditingController titleCtrl;
  late DateTime selectedDateTime;
  ReminderRepeatType repeatType = ReminderRepeatType.ONCE;
  NotificationType notificationType = NotificationType.REMINDER;

  @override
  void initState() {
    super.initState();
    titleCtrl = TextEditingController(text: widget.reminder?['title'] ?? '');
    selectedDateTime = widget.reminder != null
        ? DateTime.parse(widget.reminder!['startAt']).toLocal()
        : DateTime.now();

    if (widget.reminder != null) {
      if (widget.reminder!['repeatType'] != null) {
        repeatType = ReminderRepeatType.values.firstWhere(
          (e) => e.toString().split('.').last == widget.reminder!['repeatType'],
          orElse: () => ReminderRepeatType.ONCE,
        );
      }
      if (widget.reminder!['type'] != null) {
        notificationType = NotificationType.values.firstWhere(
          (e) => e.toString().split('.').last == widget.reminder!['type'],
          orElse: () => NotificationType.REMINDER,
        );
      }
    }
  }

  @override
  void dispose() {
    titleCtrl.dispose();
    super.dispose();
  }

  String _formattedDateTime(DateTime dt) {
    return "${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: selectedDateTime,
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(selectedDateTime),
      );
      if (time != null) {
        setState(() {
          selectedDateTime = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ReminderProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.reminder == null ? 'Tambah Reminder' : 'Edit Reminder',
          style: theme.appBarTheme.titleTextStyle,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Judul
            TextField(
              controller: titleCtrl,
              decoration: InputDecoration(
                labelText: 'Judul Reminder',
                border: theme.inputDecorationTheme.border,
                filled: theme.inputDecorationTheme.filled,
                fillColor: theme.inputDecorationTheme.fillColor,
              ),
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),

            // Date + Time Picker
            GestureDetector(
              onTap: _pickDateTime,
              child: AbsorbPointer(
                child: TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Tanggal & Waktu',
                    suffixIcon: const Icon(Icons.calendar_today),
                    border: theme.inputDecorationTheme.border,
                    filled: theme.inputDecorationTheme.filled,
                    fillColor: theme.inputDecorationTheme.fillColor,
                  ),
                  controller: TextEditingController(
                    text: _formattedDateTime(selectedDateTime),
                  ),
                  style: theme.textTheme.bodyMedium,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Notification Type
            Text("Tipe Notifikasi", style: theme.textTheme.labelLarge),
            Wrap(
              spacing: 8,
              children: NotificationType.values.map((e) {
                final isSelected = e == notificationType;
                return ChoiceChip(
                  label: Text(e.toString().split('.').last),
                  selected: isSelected,
                  selectedColor: theme.chipTheme.selectedColor,
                  labelStyle: isSelected
                      ? theme.chipTheme.secondaryLabelStyle
                      : theme.chipTheme.labelStyle,
                  onSelected: (_) => setState(() => notificationType = e),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),

            // Repeat Type
            Text("Repeat Type", style: theme.textTheme.labelLarge),
            Wrap(
              spacing: 8,
              children: ReminderRepeatType.values.map((e) {
                final isSelected = e == repeatType;
                return ChoiceChip(
                  label: Text(e.toString().split('.').last),
                  selected: isSelected,
                  selectedColor: theme.chipTheme.selectedColor,
                  labelStyle: isSelected
                      ? theme.chipTheme.secondaryLabelStyle
                      : theme.chipTheme.labelStyle,
                  onSelected: (_) => setState(() => repeatType = e),
                );
              }).toList(),
            ),

            const Spacer(),

            // Tombol Simpan
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: provider.loading
                    ? null
                    : () async {
                        if (titleCtrl.text.trim().isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Judul wajib diisi')),
                          );
                          return;
                        }

                        final payload = {
                          "title": titleCtrl.text.trim(),
                          "message":
                              "Waktunya ${titleCtrl.text.trim()} jam ${_formattedDateTime(selectedDateTime)} WIB",
                          "type": notificationType.toString().split('.').last,
                          "repeatType": repeatType.toString().split('.').last,
                          "startAt": selectedDateTime.toUtc().toIso8601String(),
                          "endAt": null,
                        };

                        if (widget.reminder == null) {
                          await provider.createReminder(payload);
                        } else {
                          await provider.updateReminder(
                            widget.reminder!['id'],
                            payload,
                          );
                        }

                        if (context.mounted) Navigator.of(context).pop();
                      },
                style: theme.elevatedButtonTheme.style,
                child: provider.loading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: theme.progressIndicatorTheme.color,
                          strokeWidth: 2,
                        ),
                      )
                    : Text('Simpan', style: theme.textTheme.labelLarge),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
