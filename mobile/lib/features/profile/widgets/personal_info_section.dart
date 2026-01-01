import 'package:flutter/material.dart';
import '../api/profile_provider.dart';
import 'editable_field.dart';
import 'read_only_field.dart';

class PersonalInfoSection extends StatelessWidget {
  final ProfileProvider provider;
  final bool isEditing;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController dobController;

  const PersonalInfoSection({
    super.key,
    required this.provider,
    required this.isEditing,
    required this.nameController,
    required this.phoneController,
    required this.dobController,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        EditableField(
          label: 'Full Name',
          value: provider.fullName,
          controller: nameController,
          icon: Icons.person,
          isEditing: isEditing,
        ),
        const Divider(),
        ReadOnlyField(
          label: 'Email',
          value: provider.email,
          icon: Icons.email,
        ),
        const Divider(),
        EditableField(
          label: 'Phone',
          value: provider.phone ?? '-',
          controller: phoneController,
          icon: Icons.phone,
          isEditing: isEditing,
        ),
        const Divider(),
        EditableField(
          label: 'Date of Birth',
          value: provider.dateOfBirth?.toIso8601String().split('T').first ?? '-',
          controller: dobController,
          icon: Icons.cake,
          isEditing: isEditing,
        ),
      ],
    );
  }
}
