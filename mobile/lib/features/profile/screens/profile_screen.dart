import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/profile_api.dart';
import '../api/profile_provider.dart';

import '../widgets/profile_header.dart';
import '../widgets/section_title.dart';
import '../widgets/personal_info_section.dart';
import '../widgets/medical_info_section.dart';
import '../widgets/profile_skeleton.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ProfileProvider(api: ProfileApi())..fetchProfile(),
      child: const _ProfileView(),
    );
  }
}

class _ProfileView extends StatefulWidget {
  const _ProfileView();

  @override
  State<_ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<_ProfileView> {
  bool isEditingPersonal = false;
  bool isEditingMedical = false;

  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final dobController = TextEditingController();

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    dobController.dispose();
    super.dispose();
  }

  void _startPersonalEdit(ProfileProvider p) {
    nameController.text = p.fullName;
    phoneController.text = p.phone ?? '';
    dobController.text =
        p.dateOfBirth?.toIso8601String().split('T').first ?? '';
    setState(() => isEditingPersonal = true);
  }

  Future<void> _savePersonal(ProfileProvider p) async {
    await p.updateProfile(
      {},
      newFullName: nameController.text,
      newPhone: phoneController.text,
      newDateOfBirth: dobController.text.isNotEmpty
          ? DateTime.parse(dobController.text)
          : null,
    );
    setState(() => isEditingPersonal = false);
  }

  Future<void> _saveMedical(ProfileProvider p) async {
    await p.saveMedicalProfile(
      newHeightCm: p.heightCm,
      newWeightKg: p.weightKg,
      newBloodType: p.bloodType,
      newAllergies: p.allergies,
      newMedications: p.medications,
    );
    setState(() => isEditingMedical = false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<ProfileProvider>(
      builder: (_, provider, __) {
        if (provider.isLoading) {
          return const Scaffold(body: ProfileSkeleton());
        }

        return Scaffold(
          backgroundColor: theme.colorScheme.surface,
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ProfileHeader(
                  isEditing: isEditingPersonal,
                  onEdit: () => _startPersonalEdit(provider),
                  onSave: () => _savePersonal(provider),
                ),
                const SizedBox(height: 32),

                const SectionTitle('Personal Information'),
                const SizedBox(height: 16),
                PersonalInfoSection(
                  provider: provider,
                  isEditing: isEditingPersonal,
                  nameController: nameController,
                  phoneController: phoneController,
                  dobController: dobController,
                ),

                const SizedBox(height: 32),
                const SectionTitle('Medical Information'),
                const SizedBox(height: 16),
                MedicalInfoSection(
                  provider: provider,
                  isEditing: isEditingMedical,
                  onToggleEdit: () {
                    if (isEditingMedical) {
                      _saveMedical(provider);
                    } else {
                      setState(() => isEditingMedical = true);
                    }
                  },
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        );
      },
    );
  }
}
