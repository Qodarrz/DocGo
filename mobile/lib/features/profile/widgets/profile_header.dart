import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/profile_provider.dart';

class ProfileHeader extends StatelessWidget {
  final bool isEditing;
  final String name;
  final String email;
  final String? avatarUrl;
  final VoidCallback onEdit;

  const ProfileHeader({
    super.key,
    required this.isEditing,
    required this.name,
    required this.email,
    this.avatarUrl,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 60,
                backgroundImage: avatarUrl?.isNotEmpty == true
                    ? NetworkImage(avatarUrl!)
                    : null,
                child: avatarUrl?.isEmpty == true
                    ? const Icon(Icons.person, size: 60, color: Colors.grey)
                    : null,
              ),
              if (isEditing)
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: theme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.edit,
                      size: 20,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            name.isNotEmpty ? name : 'No Name',
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            email,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium
                ?.copyWith(color: theme.colorScheme.primary),
          ),
        ],
      ),
    );
  }
}