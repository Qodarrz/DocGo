import 'package:docgo/app/routes.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:docgo/features/consultation/api/consultation_provider.dart';
import 'package:docgo/features/consultation/widgets/consultation_detail/doctor_header.dart';
import 'package:docgo/features/consultation/widgets/consultation_detail/schedule_section.dart';
import 'package:docgo/features/consultation/widgets/consultation_detail/action_button.dart';

class ConsultationDetailScreen extends StatefulWidget {
  final String doctorId;
  final String name;
  final String specialist;
  final String institution;
  final double rating;
  final int reviews;
  final String image;

  const ConsultationDetailScreen({
    super.key,
    required this.doctorId,
    required this.name,
    required this.specialist,
    required this.institution,
    required this.rating,
    required this.reviews,
    required this.image,
  });

  @override
  State<ConsultationDetailScreen> createState() =>
      _ConsultationDetailScreenState();
}

class _ConsultationDetailScreenState extends State<ConsultationDetailScreen> {
  final TextEditingController _dateController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  int _selectedDuration = 30;

  @override
  void initState() {
    super.initState();
    // Load data pertama kali
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<ConsultProvider>();
      provider.fetchUserConsultations();
      provider.fetchDoctorSchedule(widget.doctorId);
    });
  }

  @override
  void dispose() {
    _dateController.dispose();
    _timeController.dispose();
    super.dispose();
  }

  Map<String, dynamic>? get _activeConsultation {
    final provider = context.read<ConsultProvider>();
    final now = DateTime.now();

    // Cari konsultasi aktif dengan dokter ini
    for (final consult in provider.consultations) {
      final doctorId = consult['doctorId'] ?? consult['doctor']?['id'];
      final scheduledAt = DateTime.tryParse(
        consult['scheduledAt']?.toString() ?? '',
      );
      final status = consult['status']?.toString().toUpperCase();

      if (doctorId != widget.doctorId || scheduledAt == null) continue;

      // Status yang dianggap aktif
      if (status != 'PENDING' && status != 'ONGOING') continue;

      // Cek apakah konsultasi masih dalam waktu yang relevan
      final endTime = scheduledAt.add(const Duration(minutes: 30));
      if (now.isBefore(endTime)) {
        return consult;
      }
    }
    return null;
  }

  List<dynamic> get _todayConsultations {
    final provider = context.read<ConsultProvider>();
    final now = DateTime.now();
    final todayStart = DateTime(now.year, now.month, now.day);
    final todayEnd = todayStart.add(const Duration(days: 1));

    return provider.consultations.where((c) {
      final scheduledAt = DateTime.tryParse(c['scheduledAt']?.toString() ?? '');
      if (scheduledAt == null) return false;
      return scheduledAt.isAfter(todayStart) && scheduledAt.isBefore(todayEnd);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios,
            color: colors.onBackground,
          ),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Detail Dokter',
          style: textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      floatingActionButton: Consumer<ConsultProvider>(
        builder: (context, provider, _) {
          return _buildActionButton(provider);
        },
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              DoctorHeaderElegant(
                name: widget.name,
                specialist: widget.specialist,
                institution: widget.institution,
                rating: widget.rating,
                reviews: widget.reviews,
                image: widget.image,
              ),
              const SizedBox(height: 24),
              // Tampilkan info konsultasi aktif jika ada
              _buildActiveConsultationInfo(),
              const SizedBox(height: 16),
              // Tampilkan jadwal (hanya untuk referensi)
              ScheduleSection(
                doctorId: widget.doctorId,
                onBookingRequest: (time, dateTime) =>
                    _requestBooking(context, time, dateTime),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActiveConsultationInfo() {
    final activeConsult = _activeConsultation;
    if (activeConsult == null) return const SizedBox();

    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final textTheme = theme.textTheme;

    final scheduledAt = DateTime.parse(activeConsult['scheduledAt'].toString());
    final duration = activeConsult['durationMinutes'] ?? 30;
    final endTime = scheduledAt.add(Duration(minutes: duration));
    final now = DateTime.now();

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.access_time,
                  color: colors.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Konsultasi Aktif',
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(
                      activeConsult['status'] ?? 'PENDING',
                      theme,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _getStatusText(activeConsult['status'] ?? 'PENDING'),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '${DateFormat('dd MMM yyyy').format(scheduledAt)} • ${DateFormat('HH:mm').format(scheduledAt)} - ${DateFormat('HH:mm').format(endTime)}',
              style: textTheme.bodyMedium,
            ),
            const SizedBox(height: 12),
            if (activeConsult['chatRoom']?['id'] != null)
              Row(
                children: [
                  Icon(
                    Icons.chat,
                    color: colors.primary,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Chat Room: ${activeConsult['chatRoom']['id']}',
                    style: textTheme.bodySmall,
                  ),
                ],
              ),
            const SizedBox(height: 8),
            if (now.isBefore(scheduledAt))
              Text(
                'Chat akan tersedia dalam ${_formatDuration(scheduledAt.difference(now))}',
                style: TextStyle(
                  color: colors.primary,
                  fontWeight: FontWeight.w500,
                ),
              )
            else if (now.isBefore(endTime))
              Text(
                'Chat tersedia sekarang!',
                style: TextStyle(
                  color: colors.primary,
                  fontWeight: FontWeight.w500,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status, ThemeData theme) {
    final colors = theme.colorScheme;
    switch (status.toUpperCase()) {
      case 'ONGOING':
        return colors.primary;
      case 'PENDING':
        return colors.secondary ?? Colors.orange;
      default:
        return colors.primary;
    }
  }

  String _getStatusText(String status) {
    switch (status.toUpperCase()) {
      case 'ONGOING':
        return 'SEDANG BERLANGSUNG';
      case 'PENDING':
        return 'MENUNGGU';
      default:
        return status.toUpperCase();
    }
  }

  String _formatDuration(Duration duration) {
    if (duration.inHours > 0) {
      return '${duration.inHours} jam ${duration.inMinutes.remainder(60)} menit';
    }
    return '${duration.inMinutes} menit';
  }

  void _navigateToChat(Map<String, dynamic> consultation) {
    if (consultation['chatRoom']?['id'] != null) {
      context.push(
        AppRoutes.consultationChat,
        extra: {
          'userId': widget.doctorId,
          'chatRoomId': consultation['chatRoom']['id'],
          'userType': 'CLIENT',
        },
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Chat room tidak tersedia'),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    }
  }

  Widget _buildActionButton(ConsultProvider provider) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final activeConsult = _activeConsultation;
    final now = DateTime.now();

    if (activeConsult != null) {
      final scheduledAt = DateTime.parse(
        activeConsult['scheduledAt'].toString(),
      );
      final canStartTime = scheduledAt.subtract(const Duration(minutes: 5));
      final duration = activeConsult['durationMinutes'] ?? 30;
      final endTime = scheduledAt.add(Duration(minutes: duration));

      if (now.isAfter(canStartTime) && now.isBefore(endTime)) {
        return ActionButton.chat(
          onPressed: () => _navigateToChat(activeConsult),
        );
      }
    }

    // Cek apakah user sudah ada konsultasi hari ini dengan dokter lain
    final hasOtherConsultationToday = _todayConsultations.any((c) {
      final doctorId = c['doctorId'] ?? c['doctor']?['id'];
      final status = c['status']?.toString().toUpperCase();
      final scheduledAt = DateTime.tryParse(c['scheduledAt']?.toString() ?? '');
      if (scheduledAt == null) return false;

      final duration = c['durationMinutes'] ?? 30;
      final endTime = scheduledAt.add(Duration(minutes: duration));

      return doctorId != widget.doctorId &&
          (status == 'PENDING' || status == 'ONGOING') &&
          now.isBefore(endTime);
    });

    if (hasOtherConsultationToday) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: colors.secondary?.withOpacity(0.1) ?? Colors.orange.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: colors.secondary ?? Colors.orange.shade200,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.info_outline,
                color: colors.secondary ?? Colors.orange.shade700,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Anda sudah memiliki konsultasi aktif hari ini.',
                  style: TextStyle(
                    color: colors.secondary ?? Colors.orange.shade700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ActionButton.book(onPressed: () => _showBookingModal(provider));
  }

  void _showBookingModal(ConsultProvider provider) {
    _selectedDate = null;
    _selectedTime = null;
    _dateController.clear();
    _timeController.clear();

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          final theme = Theme.of(context);
          final colors = theme.colorScheme;
          final textTheme = theme.textTheme;

          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            title: Text(
              'Booking Konsultasi',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Input Tanggal
                  TextField(
                    controller: _dateController,
                    readOnly: true,
                    style: textTheme.bodyMedium,
                    decoration: InputDecoration(
                      labelText: 'Tanggal',
                      labelStyle: textTheme.bodyMedium,
                      prefixIcon: Icon(
                        Icons.calendar_today,
                        color: colors.onSurface,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          Icons.date_range,
                          color: colors.primary,
                        ),
                        onPressed: () => _selectDate(context, setState),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Input Waktu
                  TextField(
                    controller: _timeController,
                    readOnly: true,
                    style: textTheme.bodyMedium,
                    decoration: InputDecoration(
                      labelText: 'Waktu Mulai',
                      labelStyle: textTheme.bodyMedium,
                      prefixIcon: Icon(
                        Icons.access_time,
                        color: colors.onSurface,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          Icons.schedule,
                          color: colors.primary,
                        ),
                        onPressed: () => _selectTime(context, setState),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Informasi tentang sistem fleksibel
                  Card(
                    color: colors.primary.withOpacity(0.1),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                color: colors.primary,
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Sistem Fleksibel',
                                style: textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: colors.primary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Dokter tersedia kapan saja, asalkan waktu yang dipilih tidak bertabrakan dengan konsultasi lain.',
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.onSurface.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                style: TextButton.styleFrom(
                  foregroundColor: colors.onSurface,
                ),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                onPressed: _selectedDate != null && _selectedTime != null
                    ? () => _validateAndBook(context, provider)
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.primary,
                  foregroundColor: colors.onPrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Lanjut'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _selectDate(BuildContext context, StateSetter setState) async {
    final now = DateTime.now();
    final firstDate = DateTime(now.year, now.month, now.day);
    final lastDate = now.add(const Duration(days: 30));

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: firstDate,
      lastDate: lastDate,
      selectableDayPredicate: (DateTime day) {
        return true;
      },
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _dateController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  Future<void> _selectTime(BuildContext context, StateSetter setState) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedTime = picked;
        _timeController.text =
            '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
      });
    }
  }

  Future<void> _validateAndBook(
    BuildContext context,
    ConsultProvider provider,
  ) async {
    if (_selectedDate == null || _selectedTime == null) {
      _showErrorSnackbar('Harap lengkapi tanggal dan waktu');
      return;
    }

    // Gabungkan tanggal dan waktu
    final scheduledAt = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _selectedTime!.hour,
      _selectedTime!.minute,
    );

    // Validasi: waktu tidak boleh lebih dari 5 menit yang lalu
    final now = DateTime.now();
    if (scheduledAt.isBefore(now.subtract(const Duration(minutes: 5)))) {
      _showErrorSnackbar('Waktu yang dipilih sudah lewat');
      return;
    }

    // Validasi dengan konsultasi yang sudah ada
    final endAt = scheduledAt.add(Duration(minutes: _selectedDuration));

    // Ambil semua konsultasi dokter ini
    final doctorConsultations = provider.consultations.where((c) {
      final doctorId = c['doctorId'] ?? c['doctor']?['id'];
      return doctorId == widget.doctorId;
    }).toList();

    // Cek apakah ada tabrakan dengan konsultasi lain
    bool hasConflict = false;
    String conflictMessage = '';

    for (final consult in doctorConsultations) {
      final existingScheduledAt = DateTime.tryParse(
        consult['scheduledAt']?.toString() ?? '',
      );
      final existingDuration = consult['durationMinutes'] as int? ?? 30;
      final existingEndAt = existingScheduledAt?.add(
        Duration(minutes: existingDuration),
      );
      final status = consult['status']?.toString().toUpperCase();

      if (existingScheduledAt == null) continue;

      // Skip konsultasi yang sudah selesai/dibatalkan
      if (status == 'COMPLETED' || status == 'CANCELLED') continue;

      // Cek overlap
      if ((scheduledAt.isBefore(existingEndAt!) &&
          endAt.isAfter(existingScheduledAt))) {
        hasConflict = true;
        conflictMessage =
            'Waktu ini bertabrakan dengan konsultasi lain: ${DateFormat('dd/MM HH:mm').format(existingScheduledAt)}';
        break;
      }
    }

    if (hasConflict) {
      _showErrorSnackbar(conflictMessage);
      return;
    }

    // Tutup modal input
    if (context.mounted) Navigator.pop(context);

    // Tampilkan konfirmasi booking
    await _showBookingConfirmation(
      context,
      scheduledAt,
      _selectedDuration,
      provider,
    );
  }

  void _showErrorSnackbar(String message) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: colors.error,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  Future<void> _showBookingConfirmation(
    BuildContext context,
    DateTime scheduledAt,
    int duration,
    ConsultProvider provider,
  ) async {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final textTheme = theme.textTheme;

    final endAt = scheduledAt.add(Duration(minutes: duration));

    // Tampilkan dialog konfirmasi booking
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          title: Text(
            'Konfirmasi Booking',
            style: textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Konsultasi dengan:'),
              const SizedBox(height: 8),
              Text(
                'Dr. ${widget.name}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text('Tanggal: ${DateFormat('dd/MM/yyyy').format(scheduledAt)}'),
              Text(
                'Waktu: ${DateFormat('HH:mm').format(scheduledAt)} - ${DateFormat('HH:mm').format(endAt)}',
              ),
              const SizedBox(height: 4),
              Text('Durasi: $duration menit'),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: colors.primary.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: colors.primary,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Waktu Tersedia',
                          style: textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: colors.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Tidak ada konsultasi lain pada waktu yang dipilih.',
                      style: textTheme.bodySmall?.copyWith(
                        color: colors.onSurface.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Pembayaran dilakukan di luar aplikasi sesuai kesepakatan dengan dokter.',
                style: textTheme.bodySmall?.copyWith(
                  fontStyle: FontStyle.italic,
                  color: colors.onSurface.withOpacity(0.6),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              style: TextButton.styleFrom(
                foregroundColor: colors.onSurface,
              ),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.primary,
                foregroundColor: colors.onPrimary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Konfirmasi'),
            ),
          ],
        );
      },
    );

    // Jika user batal atau dialog tidak return true
    if (confirmed != true) return;

    // ===== Tampilkan loading =====
    if (context.mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => const Center(child: CircularProgressIndicator()),
      );
    }

    try {
      // Panggil createConsultation
      final success = await provider.createConsultation(
        doctorId: widget.doctorId,
        type: 'GENERAL',
        scheduledAt: scheduledAt,
        duration: duration,
      );

      // Tutup loading jika masih mounted
      if (context.mounted) Navigator.pop(context);

      // Tampilkan hasil
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              success
                  ? 'Booking berhasil! Chat akan tersedia 5 menit sebelum waktu konsultasi.'
                  : 'Booking gagal: ${provider.errorMessage}',
            ),
            backgroundColor: success ? colors.primary : colors.error,
            duration: const Duration(seconds: 3),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }

      if (success) {
        // Reset form & refresh data
        _dateController.clear();
        _timeController.clear();
        _selectedDate = null;
        _selectedTime = null;
        _selectedDuration = 30;

        await provider.fetchUserConsultations();
        provider.fetchDoctorSchedule(widget.doctorId);

        if (mounted) setState(() {});
      }
    } catch (e, stack) {
      if (context.mounted) {
        Navigator.pop(context); // pastikan loading ditutup
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: colors.error,
          ),
        );
      }
      print('🔥 Exception: $e');
      print('🔥 Stack trace: $stack');
    }
  }

  Future<void> _requestBooking(
    BuildContext context,
    String time,
    DateTime dateTime,
  ) async {
    final provider = context.read<ConsultProvider>();

    // Tampilkan konfirmasi langsung
    await _showBookingConfirmation(context, dateTime, 30, provider);
  }
}