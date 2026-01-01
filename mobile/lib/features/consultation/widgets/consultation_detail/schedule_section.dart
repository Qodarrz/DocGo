import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:docgo/features/consultation/api/consultation_provider.dart';

class ScheduleSection extends StatefulWidget {
  final String doctorId;
  final Function(String, DateTime) onBookingRequest;

  const ScheduleSection({
    super.key,
    required this.doctorId,
    required this.onBookingRequest,
  });

  @override
  State<ScheduleSection> createState() => _ScheduleSectionState();
}

class _ScheduleSectionState extends State<ScheduleSection> {
  bool _isTodaySelected = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Consumer<ConsultProvider>(
      builder: (context, provider, _) {
        final schedule =
            provider.doctorSchedules[widget.doctorId] ??
            {
              'today': <Map<String, dynamic>>[],
              'tomorrow': <Map<String, dynamic>>[],
            };

        final todaySlots = List<Map<String, dynamic>>.from(schedule['today']!);
        final tomorrowSlots = List<Map<String, dynamic>>.from(
          schedule['tomorrow']!,
        );

        if (provider.isLoading) {
          return _buildShimmerLoading(theme);
        }

        // Filter hanya slot yang sudah dibooking
        final bookedTodaySlots = todaySlots.where((slot) {
          final status = slot['status']?.toString().toUpperCase();
          return status == 'PENDING' || status == 'ONGOING';
        }).toList();

        final bookedTomorrowSlots = tomorrowSlots.where((slot) {
          final status = slot['status']?.toString().toUpperCase();
          return status == 'PENDING' || status == 'ONGOING';
        }).toList();

        final selectedSlots = _isTodaySelected
            ? bookedTodaySlots
            : bookedTomorrowSlots;
        final dayLabel = _isTodaySelected ? 'Hari Ini' : 'Besok';

        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: colorScheme.outline.withOpacity(0.2),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: colorScheme.shadow.withOpacity(0.05),
                blurRadius: 20,
                spreadRadius: 0,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header dengan jumlah booking
              _buildHeader(bookedTodaySlots, bookedTomorrowSlots, theme),
              const SizedBox(height: 20),

              // Toggle button untuk hari ini/besok
              _buildDayToggle(theme),
              const SizedBox(height: 24),

              // Konten sesuai hari yang dipilih
              if (selectedSlots.isEmpty)
                _buildEmptySlotsForDay(dayLabel, theme)
              else
                _buildBookedSlotsList(selectedSlots, theme),
              const SizedBox(height: 64),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(
    List bookedTodaySlots,
    List bookedTomorrowSlots,
    ThemeData theme,
  ) {
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final totalBookings = bookedTodaySlots.length + bookedTomorrowSlots.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Jadwal Terbooking',
              style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: colorScheme.onSurface,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.event_available,
                    size: 16,
                    color: colorScheme.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$totalBookings',
                    style: textTheme.labelLarge?.copyWith(
                      color: colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Lihat jadwal konsultasi yang sudah dipesan',
          style: textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildDayToggle(ThemeData theme) {
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorScheme.outline.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () {
                setState(() {
                  _isTodaySelected = true;
                });
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                decoration: BoxDecoration(
                  color: _isTodaySelected
                      ? colorScheme.primary
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.today_outlined,
                        size: 20,
                        color: _isTodaySelected
                            ? colorScheme.onPrimary
                            : colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Hari Ini',
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: _isTodaySelected
                              ? FontWeight.w600
                              : FontWeight.normal,
                          color: _isTodaySelected
                              ? colorScheme.onPrimary
                              : colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Container(
            width: 1,
            height: 24,
            color: colorScheme.outline.withOpacity(0.1),
          ),
          Expanded(
            child: InkWell(
              onTap: () {
                setState(() {
                  _isTodaySelected = false;
                });
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                decoration: BoxDecoration(
                  color: !_isTodaySelected
                      ? colorScheme.primary
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 20,
                        color: !_isTodaySelected
                            ? colorScheme.onPrimary
                            : colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Besok',
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: !_isTodaySelected
                              ? FontWeight.w600
                              : FontWeight.normal,
                          color: !_isTodaySelected
                              ? colorScheme.onPrimary
                              : colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerLoading(ThemeData theme) {
    final colorScheme = theme.colorScheme;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: colorScheme.shadow.withOpacity(0.05),
            blurRadius: 20,
            spreadRadius: 0,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Shimmer header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildShimmerBox(height: 24, width: 150),
              _buildShimmerBox(height: 32, width: 60),
            ],
          ),
          const SizedBox(height: 8),
          _buildShimmerBox(height: 16, width: 200),

          const SizedBox(height: 20),

          // Shimmer toggle
          Container(
            height: 48,
            decoration: BoxDecoration(
              color: colorScheme.surfaceVariant.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: colorScheme.outline.withOpacity(0.1)),
            ),
            child: Row(
              children: [
                Expanded(child: _buildShimmerBox(height: 48)),
                Container(width: 1, color: Colors.transparent),
                Expanded(child: _buildShimmerBox(height: 48)),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Shimmer content
          Column(
            children: List.generate(
              3,
              (index) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildShimmerSlotCard(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerBox({
    double height = 40,
    double width = double.infinity,
  }) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  Widget _buildShimmerSlotCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Shimmer circle
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 16),

          // Shimmer content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: _buildShimmerBox(height: 16)),
                    const SizedBox(width: 8),
                    _buildShimmerBox(height: 24, width: 80),
                  ],
                ),
                const SizedBox(height: 8),
                _buildShimmerBox(height: 12, width: 120),
                const SizedBox(height: 8),
                _buildShimmerBox(height: 12, width: 100),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptySlotsForDay(String dayLabel, ThemeData theme) {
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceVariant.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(
              Icons.event_busy_outlined,
              size: 48,
              color: colorScheme.onSurfaceVariant.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              'Tidak ada booking untuk $dayLabel',
              style: textTheme.bodyLarge?.copyWith(
                color: colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Semua slot masih tersedia',
              style: textTheme.bodyMedium?.copyWith(
                color: colorScheme.onSurfaceVariant.withOpacity(0.6),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBookedSlotsList(
    List<Map<String, dynamic>> slots,
    ThemeData theme,
  ) {
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Container(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(16)),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: slots.length,
        separatorBuilder: (context, index) => Divider(
          height: 16,
          thickness: 1,
          color: colorScheme.outline.withOpacity(0.1),
        ),
        itemBuilder: (context, index) {
          final slot = slots[index];
          final start = DateTime.parse(slot['start']);
          final end = DateTime.parse(slot['end']);
          final status = slot['status']?.toString() ?? 'PENDING';
          final duration = end.difference(start).inMinutes;

          return _buildBookedSlotCard(
            start: start,
            end: end,
            duration: duration,
            status: status,
            theme: theme,
          );
        },
      ),
    );
  }

  Widget _buildBookedSlotCard({
    required DateTime start,
    required DateTime end,
    required int duration,
    required String status,
    required ThemeData theme,
  }) {
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final statusUpper = status.toUpperCase();
    final statusColor = _getStatusColor(statusUpper, colorScheme);
    final startTime = _formatTime(start);
    final endTime = _formatTime(end);
    final dayName = _formatDate(start, 'EEEE, d MMMM');

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          // Handle tap on booked slot
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: colorScheme.outline.withOpacity(0.1)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Time circle indicator
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      statusColor.withOpacity(0.2),
                      statusColor.withOpacity(0.1),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        startTime,
                        style: textTheme.labelLarge?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        '${duration}m',
                        style: textTheme.labelSmall?.copyWith(
                          color: statusColor.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),

              // Slot details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '$dayName • $startTime - $endTime',
                            style: textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurface,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            statusUpper,
                            style: textTheme.labelSmall?.copyWith(
                              color: statusColor,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Duration indicator
                    if (duration > 30)
                      Container(
                        margin: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          children: [
                            Icon(
                              Icons.schedule,
                              size: 14,
                              color: Colors.orange,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Konsultasi Panjang',
                              style: textTheme.labelSmall?.copyWith(
                                color: Colors.orange,
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Status icon and text
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      child: Row(
                        children: [
                          Icon(
                            _getStatusIcon(statusUpper),
                            size: 16,
                            color: statusColor,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _getStatusText(statusUpper),
                            style: textTheme.bodySmall?.copyWith(
                              color: statusColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date, String formatPattern) {
    try {
      final format = DateFormat(formatPattern, 'id_ID');
      return format.format(date);
    } catch (e) {
      final format = DateFormat(formatPattern);
      return format.format(date);
    }
  }

  String _formatTime(DateTime date) {
    try {
      final format = DateFormat('HH:mm', 'id_ID');
      return format.format(date);
    } catch (e) {
      final format = DateFormat('HH:mm');
      return format.format(date);
    }
  }

  Color _getStatusColor(String status, ColorScheme colorScheme) {
    switch (status) {
      case 'ONGOING':
        return const Color(0xFF10B981);
      case 'PENDING':
        return const Color(0xFFF59E0B);
      case 'COMPLETED':
        return colorScheme.primary;
      case 'CANCELLED':
        return const Color(0xFFEF4444);
      default:
        return colorScheme.primary;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'ONGOING':
        return Icons.play_circle_fill_outlined;
      case 'PENDING':
        return Icons.access_time_filled;
      case 'COMPLETED':
        return Icons.check_circle_outline;
      case 'CANCELLED':
        return Icons.cancel_outlined;
      default:
        return Icons.event_outlined;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'ONGOING':
        return 'Sedang berlangsung';
      case 'PENDING':
        return 'Menunggu konfirmasi';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return 'Menunggu';
    }
  }
}
