import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:docgo/app/routes.dart';

class DiagnosisResultScreen extends StatelessWidget {
  final Map<String, dynamic> data;

  const DiagnosisResultScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final mainComplaint = (data['main_complaint'] ?? '') as String;
    final duration = (data['duration'] ?? '') as String;
    final severity = (data['severity'] ?? 0) as int;
    final additional = (data['additional_symptom'] ?? '') as String;

    return Scaffold(
      backgroundColor: Colors.white,
      
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Ringkasan Keluhan', style: theme.textTheme.titleLarge),
              const SizedBox(height: 16),
              _InfoTile(title: 'Keluhan utama', value: mainComplaint),
              _InfoTile(title: 'Durasi', value: duration),
              _InfoTile(title: 'Tingkat keparahan', value: '$severity / 5'),
              if (additional.isNotEmpty)
                _InfoTile(title: 'Gejala tambahan', value: additional),
              const SizedBox(height: 24),

              Text('Kemungkinan Kondisi', style: theme.textTheme.titleLarge),
              const SizedBox(height: 16),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 2,
                shadowColor: Colors.black12,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Infeksi Saluran Pernapasan Atas (ISPA)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Berdasarkan gejala yang kamu masukkan, kondisi ini '
                        'sering ditandai dengan demam, sakit kepala, dan rasa lelah.',
                        style: TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Text('Rekomendasi', style: theme.textTheme.titleLarge),
              const SizedBox(height: 12),
              _RecommendationItem(
                text: 'Istirahat yang cukup dan perbanyak minum air putih',
              ),
              _RecommendationItem(
                text: 'Konsumsi obat penurun demam jika diperlukan',
              ),
              _RecommendationItem(
                text: 'Segera konsultasi jika gejala memburuk',
              ),
              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: () {
                    context.push(AppRoutes.consultation);
                  },
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Konsultasi dengan Dokter'),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () => context.go(AppRoutes.home),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.grey),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Kembali ke Beranda'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final String title;
  final String value;

  const _InfoTile({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.bodySmall?.copyWith(color: Colors.grey[700]),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _RecommendationItem extends StatelessWidget {
  final String text;

  const _RecommendationItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle_outline, size: 20, color: Colors.green),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }
}
