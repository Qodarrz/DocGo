import 'package:flutter/material.dart';

class PersonalInfoSection extends StatelessWidget {
  final bool isEditing;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController dobController;
  final String initialName;
  final String? initialPhone;
  final String email;
  final DateTime? initialDob;

  const PersonalInfoSection({
    super.key,
    required this.isEditing,
    required this.nameController,
    required this.phoneController,
    required this.dobController,
    required this.initialName,
    required this.email,
    this.initialPhone,
    this.initialDob,
  });

  Widget _buildField({
    required String label,
    required String icon,
    required String value,
    required TextEditingController controller,
    bool isEditing = false,
    VoidCallback? onTap,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          SizedBox(
            width: 40,
            child: Icon(
              _getIcon(icon),
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                isEditing
                    ? TextField(
                        controller: controller,
                        decoration: InputDecoration(
                          hintText: value,
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(vertical: 4),
                        ),
                        keyboardType: keyboardType,
                        readOnly: onTap != null,
                        onTap: onTap,
                      )
                    : Text(
                        value,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'person':
        return Icons.person;
      case 'email':
        return Icons.email;
      case 'phone':
        return Icons.phone;
      case 'cake':
        return Icons.cake;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildField(
            label: 'Full Name',
            icon: 'person',
            value: initialName,
            controller: nameController,
            isEditing: isEditing,
          ),
          const Divider(height: 1),
          _buildField(
            label: 'Email',
            icon: 'email',
            value: email,
            controller: TextEditingController(text: email),
            isEditing: false,
          ),
          const Divider(height: 1),
          _buildField(
            label: 'Phone',
            icon: 'phone',
            value: initialPhone ?? 'Not set',
            controller: phoneController,
            isEditing: isEditing,
            keyboardType: TextInputType.phone,
          ),
          const Divider(height: 1),
          _buildField(
            label: 'Date of Birth',
            icon: 'cake',
            value: initialDob?.toIso8601String().split('T').first ?? 'Not set',
            controller: dobController,
            isEditing: isEditing,
            onTap: isEditing
                ? () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: initialDob ?? DateTime.now(),
                      firstDate: DateTime(1900),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) {
                      dobController.text = date.toIso8601String().split('T').first;
                    }
                  }
                : null,
          ),
        ],
      ),
    );
  }
}