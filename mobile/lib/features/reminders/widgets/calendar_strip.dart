import 'package:docgo/theme/colors.dart';
import 'package:flutter/material.dart';

/// Horizontal calendar strip untuk memilih tanggal
class CalendarStrip extends StatelessWidget {
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelect;

  const CalendarStrip({
    super.key,
    required this.selectedDate,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final today = DateTime.now();

    return Container(
      color: colorScheme.background,
      padding: const EdgeInsets.only(bottom: 8),
      child: SizedBox(
        height: 150,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
          itemCount: 30, // tampil 30 hari ke depan
          itemBuilder: (_, i) {
            final date = today.add(Duration(days: i));
            final isSelected =
                date.year == selectedDate.year &&
                date.month == selectedDate.month &&
                date.day == selectedDate.day;

            return GestureDetector(
              onTap: () => onSelect(date),
              child: Container(
                width: 64,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: isSelected ? colorScheme.primary : const Color.fromARGB(255, 114, 114, 114),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      _weekday(date.weekday),
                      style: textTheme.labelMedium?.copyWith(
                        color: isSelected
                            ? colorScheme.onPrimary.withOpacity(0.8)
                            : colorScheme.background.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      date.day.toString(),
                      style: textTheme.headlineSmall?.copyWith(
                        color: isSelected
                            ? colorScheme.onPrimary
                            : colorScheme.background,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  String _weekday(int day) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[day - 1];
  }
}