import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ProfileSkeleton extends StatelessWidget {
  const ProfileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final baseColor = Colors.grey.shade300.withOpacity(0.9);
    final highlightColor = Colors.grey.shade100;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,

      body: SafeArea(
        child: Shimmer.fromColors(
          baseColor: baseColor,
          highlightColor: highlightColor,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _headerSkeleton(),
                const SizedBox(height: 40),

                _sectionTitle(),
                const SizedBox(height: 16),
                _fieldRow(),
                _fieldRow(),
                _fieldRow(),

                const SizedBox(height: 40),
                _sectionTitle(),
                const SizedBox(height: 16),
                _fieldRow(),
                _fieldRow(),
                _fieldRow(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // =========================
  // SKELETON PARTS
  // =========================

  Widget _headerSkeleton() {
    return Center(
      child: Column(
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          Container(height: 20, width: 160, decoration: _rounded()),
          const SizedBox(height: 8),
          Container(height: 14, width: 200, decoration: _rounded()),
          const SizedBox(height: 20),
          Container(height: 36, width: 110, decoration: _rounded(radius: 20)),
        ],
      ),
    );
  }

  Widget _sectionTitle() {
    return Container(height: 18, width: 180, decoration: _rounded());
  }

  Widget _fieldRow() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(width: 24, height: 24, decoration: _rounded(radius: 6)),
          const SizedBox(width: 16),
          Expanded(child: Container(height: 16, decoration: _rounded())),
        ],
      ),
    );
  }

  BoxDecoration _rounded({double radius = 8}) {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(radius),
    );
  }
}
