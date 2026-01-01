import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:docgo/app/routes.dart';

class DiagnosisFormScreen extends StatefulWidget {
  final String? initialSymptom;

  const DiagnosisFormScreen({super.key, this.initialSymptom});

  @override
  State<DiagnosisFormScreen> createState() => _DiagnosisFormScreenState();
}

class _DiagnosisFormScreenState extends State<DiagnosisFormScreen> {
  final _mainComplaintController = TextEditingController();
  final _additionalController = TextEditingController();

  String _duration = '1-3 hari';
  int _severity = 3;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _mainComplaintController.text = widget.initialSymptom ?? '';
  }

  @override
  void dispose() {
    _mainComplaintController.dispose();
    _additionalController.dispose();
    super.dispose();
  }

  void _submit() {
    final main = _mainComplaintController.text.trim();
    if (main.isEmpty) return;

    setState(() => _isLoading = true);

    context.push(
      AppRoutes.diagnosisresult,
      extra: {
        'main_complaint': main,
        'duration': _duration,
        'severity': _severity,
        'additional_symptom': _additionalController.text.trim(),
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.only(bottom: 24),
          children: [
            _DiagnosisHeader(theme: theme),
            const SizedBox(height: 24),

            // ===== FORM =====
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _SectionTitle(title: 'Keluhan Utama', theme: theme),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _mainComplaintController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Contoh: demam, sakit kepala, mual',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 20),

                  _SectionTitle(title: 'Durasi Keluhan', theme: theme),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _duration,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: 'Kurang dari 1 hari',
                        child: Text('Kurang dari 1 hari'),
                      ),
                      DropdownMenuItem(
                        value: '1-3 hari',
                        child: Text('1-3 hari'),
                      ),
                      DropdownMenuItem(
                        value: 'Lebih dari 3 hari',
                        child: Text('Lebih dari 3 hari'),
                      ),
                      DropdownMenuItem(
                        value: 'Lebih dari 1 minggu',
                        child: Text('Lebih dari 1 minggu'),
                      ),
                    ],
                    onChanged: (v) => setState(() => _duration = v!),
                  ),
                  const SizedBox(height: 20),

                  _SectionTitle(title: 'Tingkat Keparahan', theme: theme),
                  Slider(
                    value: _severity.toDouble(),
                    min: 1,
                    max: 5,
                    divisions: 4,
                    label: '$_severity',
                    onChanged: (v) => setState(() => _severity = v.toInt()),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Ringan'),
                      Text('Parah'),
                    ],
                  ),
                  const SizedBox(height: 20),

                  _SectionTitle(
                    title: 'Gejala Tambahan (Opsional)',
                    theme: theme,
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _additionalController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Contoh: pusing, muntah, lemas',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 32),

                  SizedBox(
                    height: 48,
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      child: _isLoading
                          ? const CircularProgressIndicator()
                          : const Text('Analisa Gejala'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* =========================
   HEADER MODERN (APPBAR)
   ========================= */
class _DiagnosisHeader extends StatelessWidget {
  final ThemeData theme;

  const _DiagnosisHeader({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.primary,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withOpacity(0.15),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 12),
          Text(
            'Diagnosis Kondisi Anda',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Masukkan detail keluhan untuk mendapatkan analisis terkait kondisi tubuh anda.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final ThemeData theme;

  const _SectionTitle({
    required this.title,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
      ),
    );
  }
}
