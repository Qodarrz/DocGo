import 'package:flutter/material.dart';
import '../api/profile_provider.dart';
import 'health_field.dart';
import 'list_field.dart';

class MedicalInfoSection extends StatelessWidget {
  final ProfileProvider provider;
  final bool isEditing;
  final VoidCallback onToggleEdit;

  const MedicalInfoSection({
    super.key,
    required this.provider,
    required this.isEditing,
    required this.onToggleEdit,
  });

  String _format(List<Map<String, dynamic>> items) =>
      items.isEmpty ? '-' : items.map((e) => e['name']).join(', ');

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        HealthField(
          provider: provider,
          label: 'Blood Type',
          value: provider.bloodType ?? '-',
          icon: Icons.bloodtype,
          isEditing: isEditing,
        ),
        const Divider(),
        HealthField(
          provider: provider,
          label: 'Height (cm)',
          value: provider.heightCm?.toString() ?? '-',
          icon: Icons.height,
          isEditing: isEditing,
        ),
        const Divider(),
        HealthField(
          provider: provider,
          label: 'Weight (kg)',
          value: provider.weightKg?.toString() ?? '-',
          icon: Icons.monitor_weight,
          isEditing: isEditing,
        ),
        const Divider(),
        ListField(
          label: 'Medications',
          value: _format(provider.medications),
          icon: Icons.medication,
        ),
        const Divider(),
        ListField(
          label: 'Allergies',
          value: _format(provider.allergies),
          icon: Icons.warning,
        ),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          icon: Icon(isEditing ? Icons.check : Icons.edit),
          label: Text(isEditing ? 'Save Medical' : 'Edit Medical'),
          onPressed: onToggleEdit,
        ),
      ],
    );
  }
}
