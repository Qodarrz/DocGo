import 'package:flutter/material.dart';
import '../api/profile_provider.dart';

class HealthField extends StatelessWidget {
  final ProfileProvider provider;
  final String label;
  final String value;
  final IconData icon;
  final bool isEditing;

  const HealthField({
    super.key,
    required this.provider,
    required this.label,
    required this.value,
    required this.icon,
    required this.isEditing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Icon(icon, color: theme.colorScheme.primary),
        const SizedBox(width: 16),
        Expanded(
          child: isEditing
              ? TextField(
                  controller: TextEditingController(text: value)
                    ..selection = TextSelection.collapsed(
                      offset: value.length,
                    ),
                  decoration: InputDecoration(labelText: label),
                  keyboardType: _keyboardType(label),
                  onChanged: (text) => _update(provider, label, text),
                )
              : _Display(
                  label: label,
                  value: value,
                ),
        ),
      ],
    );
  }

  TextInputType _keyboardType(String label) {
    if (label.contains('(cm)') || label.contains('(kg)')) {
      return TextInputType.number;
    }
    return TextInputType.text;
  }

  void _update(ProfileProvider p, String label, String text) {
    switch (label) {
      case 'Height (cm)':
        p.heightCm = int.tryParse(text);
        break;
      case 'Weight (kg)':
        p.weightKg = int.tryParse(text);
        break;
      case 'Blood Type':
        p.bloodType = text;
        break;
    }
  }
}

class _Display extends StatelessWidget {
  final String label;
  final String value;

  const _Display({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: theme.textTheme.bodyMedium,
        ),
        const SizedBox(height: 4),
        Text(
          value.isNotEmpty ? value : '-',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}
