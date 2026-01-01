import 'package:flutter/material.dart';

class ListField extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const ListField({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: theme.colorScheme.primary),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label),
              const SizedBox(height: 4),
              Text(value.isNotEmpty ? value : '-'),
            ],
          ),
        ),
      ],
    );
  }
}
