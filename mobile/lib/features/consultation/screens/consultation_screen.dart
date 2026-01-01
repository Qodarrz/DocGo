import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import 'package:docgo/app/routes.dart';
import 'package:docgo/features/consultation/api/consultation_provider.dart';

class ConsultationScreen extends StatefulWidget {
  const ConsultationScreen({super.key});

  @override
  State<ConsultationScreen> createState() => _ConsultationScreenState();
}

class _ConsultationScreenState extends State<ConsultationScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';
  String _searchQuery = '';

  final List<String> categories = ['All', 'General', 'Nutrition', 'Orthopedic'];

  Future<void> _refreshData() async {
    await context.read<ConsultProvider>().fetchDoctorsList();
    await context.read<ConsultProvider>().fetchUserConsultations();
  }

  List<dynamic> _getFilteredDoctors(ConsultProvider provider) {
    List<dynamic> filtered = List.from(provider.doctorsList);

    if (_selectedCategory != 'All') {
      filtered = filtered.where((doctor) {
        final specialization = (doctor['specialization'] ?? '').toString();
        return specialization.toLowerCase().contains(
          _selectedCategory.toLowerCase(),
        );
      }).toList();
    }

    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((doctor) {
        final user = doctor['user'] ?? {};
        final fullName = (user['fullName'] ?? '').toString().toLowerCase();
        final specialization =
            (doctor['specialization'] ?? '').toString().toLowerCase();
        final bio = (doctor['bio'] ?? '').toString().toLowerCase();

        return fullName.contains(_searchQuery.toLowerCase()) ||
            specialization.contains(_searchQuery.toLowerCase()) ||
            bio.contains(_searchQuery.toLowerCase());
      }).toList();
    }

    return filtered;
  }

  @override
  void initState() {
    super.initState();
    // Load data pertama kali
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<ConsultProvider>(
      builder: (context, provider, _) {
        return Scaffold(
          body: SafeArea(
            child: RefreshIndicator(
              onRefresh: _refreshData,
              child: Column(
                children: [
                  // ===== Header =====
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Cari Dokter Terbaik",
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.onBackground,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: theme.colorScheme.surface,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: [
                                    BoxShadow(
                                      color: theme.shadowColor.withOpacity(0.05),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: TextField(
                                  controller: _searchController,
                                  onChanged: (value) {
                                    setState(() {
                                      _searchQuery = value;
                                    });
                                  },
                                  decoration: InputDecoration(
                                    hintText: 'Cari dokter...',
                                    prefixIcon: const Icon(Icons.search),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide.none,
                                    ),
                                    suffixIcon: _searchQuery.isNotEmpty
                                        ? IconButton(
                                            icon: const Icon(Icons.clear),
                                            onPressed: () {
                                              setState(() {
                                                _searchController.clear();
                                                _searchQuery = '';
                                              });
                                            },
                                          )
                                        : null,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              height: 50,
                              width: 50,
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: theme.shadowColor.withOpacity(0.05),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: IconButton(
                                icon: const Icon(
                                  Icons.filter_list,
                                  color: Colors.white,
                                ),
                                onPressed: () {
                                  _showFilterDialog(context);
                                },
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 40,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: categories.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 8),
                            itemBuilder: (context, index) {
                              final category = categories[index];
                              return ChoiceChip(
                                label: Text(category),
                                selected: _selectedCategory == category,
                                onSelected: (_) {
                                  setState(() {
                                    _selectedCategory = category;
                                  });
                                },
                                selectedColor: theme.colorScheme.primary,
                                backgroundColor: theme.colorScheme.surface,
                                labelStyle: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: _selectedCategory == category
                                      ? theme.colorScheme.onPrimary
                                      : theme.colorScheme.onSurface,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(
                                    color: Colors.grey.shade300,
                                    width: 1,
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ===== Doctors List =====
                  Expanded(child: _buildDoctorsList(provider, theme)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDoctorsList(ConsultProvider provider, ThemeData theme) {
    if (provider.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              provider.errorMessage,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _refreshData(),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      );
    }

    final filteredDoctors = _getFilteredDoctors(provider);

    if (filteredDoctors.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              _searchQuery.isNotEmpty
                  ? 'Tidak ada dokter yang sesuai dengan pencarian'
                  : 'Belum ada dokter tersedia',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: filteredDoctors.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final doctor = filteredDoctors[index];
        final user = doctor['user'] ?? {};
        final name = user['fullName'] ?? 'Dr. Unknown';
        final specialist = doctor['specialization'] ?? '-';
        final institution = doctor['licenseNumber'] ?? '-';
        final rating = (doctor['experienceYear'] ?? 0).toDouble();
        final image = doctor['image'] ??
            'https://az4khupscvsqksn6.public.blob.vercel-storage.com/defaultdoctor.png';
        final reviews = 0;

        // Cek apakah ada konsultasi aktif dengan dokter ini
        final activeConsultation = provider.getActiveConsultationForDoctor(doctor['id']?.toString() ?? doctor['_id']?.toString() ?? '');

        return _DoctorCard(
          name: name,
          specialist: specialist,
          institution: institution,
          rating: rating,
          reviews: reviews,
          image: image,
          theme: Theme.of(context),
          hasActiveConsultation: activeConsultation != null,
          onTap: () {
            _navigateToDoctorDetail(context, doctor);
          },
        );
      },
    );
  }

  void _showFilterDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Filter Dokter'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Kategori Spesialisasi'),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: categories.map((category) {
                  return FilterChip(
                    label: Text(category),
                    selected: _selectedCategory == category,
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategory = category;
                      });
                      context.pop();
                    },
                  );
                }).toList(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedCategory = 'All';
                });
                context.pop();
              },
              child: const Text('Reset'),
            ),
            TextButton(
              onPressed: () => context.pop(),
              child: const Text('Tutup'),
            ),
          ],
        );
      },
    );
  }

  void _navigateToDoctorDetail(
      BuildContext context, Map<String, dynamic> doctor) {
    final user = doctor['user'] ?? {};
    final doctorId = doctor['id']?.toString() ?? doctor['_id']?.toString() ?? '';

    if (doctorId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data dokter tidak lengkap')),
      );
      return;
    }

    context.push('${AppRoutes.consultation}/detail', extra: {
      'doctorId': doctorId,
      'name': user['fullName'] ?? 'Dr. Unknown',
      'specialist': doctor['specialization'] ?? '-',
      'institution': doctor['licenseNumber'] ?? '-',
      'rating': (doctor['experienceYear'] ?? 0).toDouble(),
      'reviews': 0,
      'image': doctor['image'] ?? '',
    });
  }
}

class _DoctorCard extends StatelessWidget {
  final String name;
  final String specialist;
  final String institution;
  final double rating;
  final int reviews;
  final String image;
  final ThemeData theme;
  final bool hasActiveConsultation;
  final VoidCallback onTap;

  const _DoctorCard({
    required this.name,
    required this.specialist,
    required this.institution,
    required this.rating,
    required this.reviews,
    required this.image,
    required this.theme,
    this.hasActiveConsultation = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: theme.shadowColor.withOpacity(0.08),
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
          border: hasActiveConsultation
              ? Border.all(
                  color: theme.colorScheme.primary,
                  width: 2,
                )
              : null,
        ),
        child: Row(
          children: [
            Expanded(
              flex: 2,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (hasActiveConsultation)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.chat,
                                  size: 12,
                                  color: theme.colorScheme.primary,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'Chat Tersedia',
                                  style: theme.textTheme.labelSmall?.copyWith(
                                    color: theme.colorScheme.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      name,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      specialist,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.8),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      institution,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface.withOpacity(0.6),
                      ),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          rating.toStringAsFixed(1),
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "($reviews ulasan)",
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              flex: 1,
              child: ClipRRect(
                borderRadius: const BorderRadius.only(
                  topRight: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Positioned(
                      right: -40,
                      bottom: -50,
                      child: Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                    Image.network(
                      image,
                      fit: BoxFit.cover,
                      height: double.infinity,
                      loadingBuilder: (context, child, loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Container(
                          color: Colors.grey[200],
                          child: Center(
                            child: CircularProgressIndicator(
                              value: loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded /
                                      loadingProgress.expectedTotalBytes!
                                  : null,
                            ),
                          ),
                        );
                      },
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: Colors.grey[200],
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.person,
                                  size: 40,
                                  color: theme.colorScheme.onSurface
                                      .withOpacity(0.3),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'No Image',
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.5),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}