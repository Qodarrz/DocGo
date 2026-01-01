import 'package:flutter/material.dart';

class MedicalInfoSection extends StatefulWidget {
  final bool isEditing;
  final TextEditingController heightController;
  final TextEditingController weightController;
  final TextEditingController bloodTypeController;
  final List<Map<String, dynamic>> allergies;
  final List<Map<String, dynamic>> medications;
  final ValueChanged<List<Map<String, dynamic>>> onAllergiesChanged;
  final ValueChanged<List<Map<String, dynamic>>> onMedicationsChanged;
  final int? initialHeight;
  final int? initialWeight;
  final String? initialBloodType;
  final List<Map<String, dynamic>> initialAllergies;
  final List<Map<String, dynamic>> initialMedications;

  const MedicalInfoSection({
    super.key,
    required this.isEditing,
    required this.heightController,
    required this.weightController,
    required this.bloodTypeController,
    required this.allergies,
    required this.medications,
    required this.onAllergiesChanged,
    required this.onMedicationsChanged,
    this.initialHeight,
    this.initialWeight,
    this.initialBloodType,
    this.initialAllergies = const [],
    this.initialMedications = const [],
  });

  @override
  State<MedicalInfoSection> createState() => _MedicalInfoSectionState();
}

class _MedicalInfoSectionState extends State<MedicalInfoSection> {
  late List<Map<String, dynamic>> _allergies;
  late List<Map<String, dynamic>> _medications;

  @override
  void initState() {
    super.initState();
    _allergies = List.from(widget.allergies);
    _medications = List.from(widget.medications);
  }

  @override
  void didUpdateWidget(covariant MedicalInfoSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.isEditing && oldWidget.isEditing) {
      _allergies = List.from(widget.allergies);
      _medications = List.from(widget.medications);
    }
  }

  void _addAllergy() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Allergy'),
        content: TextField(
          autofocus: true,
          onSubmitted: (value) {
            if (value.trim().isNotEmpty) {
              setState(() {
                _allergies.add({'name': value.trim()});
              });
              widget.onAllergiesChanged(_allergies);
              Navigator.pop(context);
            }
          },
          decoration: const InputDecoration(
            hintText: 'Enter allergy name',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final controller = context.findAncestorStateOfType<_MedicalInfoSectionState>()?._textController;
              if (controller?.text.trim().isNotEmpty == true) {
                setState(() {
                  _allergies.add({'name': controller!.text.trim()});
                });
                widget.onAllergiesChanged(_allergies);
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _removeAllergy(int index) {
    setState(() {
      _allergies.removeAt(index);
    });
    widget.onAllergiesChanged(_allergies);
  }

  void _addMedication() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Medication'),
        content: TextField(
          autofocus: true,
          onSubmitted: (value) {
            if (value.trim().isNotEmpty) {
              setState(() {
                _medications.add({'name': value.trim()});
              });
              widget.onMedicationsChanged(_medications);
              Navigator.pop(context);
            }
          },
          decoration: const InputDecoration(
            hintText: 'Enter medication name',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final controller = context.findAncestorStateOfType<_MedicalInfoSectionState>()?._textController;
              if (controller?.text.trim().isNotEmpty == true) {
                setState(() {
                  _medications.add({'name': controller!.text.trim()});
                });
                widget.onMedicationsChanged(_medications);
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _removeMedication(int index) {
    setState(() {
      _medications.removeAt(index);
    });
    widget.onMedicationsChanged(_medications);
  }

  final TextEditingController _textController = TextEditingController();

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Widget _buildMedicalField({
    required String label,
    required String icon,
    required String value,
    required TextEditingController controller,
    bool isEditing = false,
    String suffix = '',
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
                    ? Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: controller,
                              decoration: InputDecoration(
                                hintText: value == 'Not set' ? 'Enter $label' : value,
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(vertical: 4),
                              ),
                              keyboardType: keyboardType,
                            ),
                          ),
                          if (suffix.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(left: 8),
                              child: Text(
                                suffix,
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                        ],
                      )
                    : Text(
                        value == 'Not set' ? value : '$value$suffix',
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

  Widget _buildArraySection({
    required String label,
    required List<Map<String, dynamic>> items,
    required bool isEditing,
    required VoidCallback onAdd,
    required Function(int) onRemove,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 40,
            child: Icon(
              label == 'Allergies' ? Icons.warning : Icons.medication,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (isEditing)
                      IconButton(
                        icon: const Icon(Icons.add, size: 20),
                        onPressed: onAdd,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                if (items.isEmpty)
                  Text(
                    'No $label',
                    style: const TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ...items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  return Row(
                    children: [
                      Expanded(
                        child: Text(
                          item['name'] ?? item.toString(),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      if (isEditing)
                        IconButton(
                          icon: const Icon(Icons.remove, size: 20, color: Colors.red),
                          onPressed: () => onRemove(index),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                    ],
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'bloodtype':
        return Icons.bloodtype;
      case 'height':
        return Icons.height;
      case 'weight':
        return Icons.monitor_weight;
      case 'medication':
        return Icons.medication;
      case 'warning':
        return Icons.warning;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayAllergies = widget.isEditing ? _allergies : widget.initialAllergies;
    final displayMedications = widget.isEditing ? _medications : widget.initialMedications;

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
          _buildMedicalField(
            label: 'Blood Type',
            icon: 'bloodtype',
            value: widget.initialBloodType ?? 'Not set',
            controller: widget.bloodTypeController,
            isEditing: widget.isEditing,
          ),
          const Divider(height: 1),
          _buildMedicalField(
            label: 'Height',
            icon: 'height',
            value: widget.initialHeight?.toString() ?? 'Not set',
            controller: widget.heightController,
            isEditing: widget.isEditing,
            suffix: ' cm',
            keyboardType: TextInputType.number,
          ),
          const Divider(height: 1),
          _buildMedicalField(
            label: 'Weight',
            icon: 'weight',
            value: widget.initialWeight?.toString() ?? 'Not set',
            controller: widget.weightController,
            isEditing: widget.isEditing,
            suffix: ' kg',
            keyboardType: TextInputType.number,
          ),
          const Divider(height: 1),
          _buildArraySection(
            label: 'Medications',
            items: displayMedications,
            isEditing: widget.isEditing,
            onAdd: _addMedication,
            onRemove: _removeMedication,
          ),
          const Divider(height: 1),
          _buildArraySection(
            label: 'Allergies',
            items: displayAllergies,
            isEditing: widget.isEditing,
            onAdd: _addAllergy,
            onRemove: _removeAllergy,
          ),
        ],
      ),
    );
  }
}