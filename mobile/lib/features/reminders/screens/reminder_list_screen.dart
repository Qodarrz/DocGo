import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:docgo/features/reminders/providers/reminder_provider.dart';
import 'package:docgo/features/reminders/widgets/reminder_card.dart';
import 'package:docgo/features/reminders/widgets/empty_state.dart';
import 'package:docgo/features/reminders/widgets/calendar_strip.dart';
/// Screen utama untuk menampilkan daftar reminder dengan calendar
class ReminderListScreen extends StatefulWidget {
  const ReminderListScreen({super.key});

  @override
  State<ReminderListScreen> createState() => _ReminderListScreenState();
}

class _ReminderListScreenState extends State<ReminderListScreen> {
  DateTime selectedDate = DateTime.now();
  bool _showCalendar = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReminderProvider>().fetchRemindersByDate(selectedDate);
    });
  }

  void _toggleCalendar() {
    setState(() {
      _showCalendar = !_showCalendar;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Consumer<ReminderProvider>(
      builder: (_, provider, __) {
        return Scaffold(
          backgroundColor: colorScheme.background,
          body: Column(
            children: [
              _buildAppBar(context),
              Expanded(
                child: CustomScrollView(
                  slivers: [
                    // Section header untuk reminders
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("Reminders", style: textTheme.titleLarge),
                            if (!_showCalendar)
                              TextButton.icon(
                                onPressed: _toggleCalendar,
                                icon: const Icon(Icons.calendar_today, size: 16),
                                label: Text(
                                  _formatDateShort(selectedDate),
                                  style: textTheme.bodyMedium,
                                ),
                                style: TextButton.styleFrom(
                                  foregroundColor: colorScheme.primary,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),

                    // List reminders atau empty state
                    if (provider.reminders.isEmpty)
                      SliverFillRemaining(child: const EmptyState())
                    else
                      SliverList(
                        delegate: SliverChildBuilderDelegate((context, index) {
                          final r = provider.reminders[index];
                          final time = DateTime.parse(r['startAt']).toLocal();

                          return Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ReminderCard(
                              title: r['title'],
                              time:
                                  "${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}",
                              onEdit: () {
                                Navigator.of(context).pushNamed('/form', arguments: r);
                              },
                              onDelete: () {
                                provider.deleteReminder(r['id']);
                              },
                            ),
                          );
                        }, childCount: provider.reminders.length),
                      ),
                  ],
                ),
              ),
            ],
          ),
          floatingActionButton: FloatingActionButton.extended(
            backgroundColor: colorScheme.primary,
            onPressed: () {
              Navigator.of(context).pushNamed('/form');
            },
            icon: const Icon(Icons.add),
            label: const Text("Add Reminder"),
          ),
        );
      },
    );
  }

  Widget _buildAppBar(BuildContext context) {
    final theme = Theme.of(context);
    final textTheme = theme.textTheme;
    final colorScheme = theme.colorScheme;

    return Container(
      color: colorScheme.background,
      child: Column(
        children: [
          // Bagian atas app bar dengan judul dan tombol kalender
          Container(
            padding: const EdgeInsets.only(
              top: 50,
              left: 16,
              right: 16,
              bottom: 16,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Tracking your health",
                      style: textTheme.headlineSmall,
                    ),
                    if (_showCalendar) const SizedBox(height: 4),
                    if (_showCalendar)
                      Text(
                        _formatDate(selectedDate),
                        style: textTheme.bodyMedium?.copyWith(
                          color: colorScheme.onBackground.withOpacity(0.6),
                        ),
                      ),
                  ],
                ),
                IconButton(
                  icon: Icon(
                    _showCalendar ? Icons.calendar_today : Icons.calendar_month,
                    color: colorScheme.onBackground,
                    size: 24,
                  ),
                  onPressed: _toggleCalendar,
                ),
              ],
            ),
          ),

          // Kalender strip (jika ditampilkan)
          if (_showCalendar)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: CalendarStrip(
                selectedDate: selectedDate,
                onSelect: (date) {
                  setState(() {
                    selectedDate = date;
                  });
                  context.read<ReminderProvider>().fetchRemindersByDate(date);
                },
              ),
            ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return '${_weekdayFull(date.weekday)}, ${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String _formatDateShort(DateTime date) {
    return '${_weekday(date.weekday)}, ${date.day.toString().padLeft(2, '0')}';
  }

  String _weekdayFull(int day) {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return days[day - 1];
  }

  String _weekday(int day) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[day - 1];
  }
}