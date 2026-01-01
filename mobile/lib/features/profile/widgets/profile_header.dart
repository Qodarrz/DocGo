import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/profile_provider.dart';

class ProfileHeader extends StatelessWidget {
  final bool isEditing;
  final VoidCallback onEdit;
  final VoidCallback onSave;

  const ProfileHeader({
    super.key,
    required this.isEditing,
    required this.onEdit,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProfileProvider>();
    final theme = Theme.of(context);

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          CircleAvatar(
            radius: 60,
            backgroundImage: provider.userProfile.isNotEmpty
                ? NetworkImage(provider.userProfile)
                : null,
            child: provider.userProfile.isEmpty
                ? const Icon(Icons.person, size: 60)
                : null,
          ),
          const SizedBox(height: 16),
          Text(
            provider.fullName.isNotEmpty ? provider.fullName : '-',
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            provider.email,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: theme.colorScheme.primary),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            icon: Icon(isEditing ? Icons.check : Icons.edit),
            label: Text(isEditing ? 'Save' : 'Edit'),
            onPressed: isEditing ? onSave : onEdit,
          ),
        ],
      ),
    );
  }
}
