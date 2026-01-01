import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../api/profile_api.dart';
import '../api/profile_provider.dart';

import '../widgets/profile_header.dart';
import '../widgets/section_title.dart';
import '../widgets/personal_info_section.dart';
import '../widgets/medical_info_section.dart';
import '../widgets/profile_skeleton.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => ProfileScreenState();
}

class ProfileScreenState extends State<ProfileScreen> {
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
  bool _isEditing = false;
  bool _isSaving = false;

  // Controllers untuk personal info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _dobController = TextEditingController();
  
  // Controllers untuk medical info
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _bloodTypeController = TextEditingController();
  
  // State untuk arrays
  List<Map<String, dynamic>> _currentAllergies = [];
  List<Map<String, dynamic>> _currentMedications = [];

  // State untuk menyimpan nilai awal saat mulai edit
  String _initialName = '';
  String? _initialPhone;
  String? _initialDobString;
  String? _initialHeightString;
  String? _initialWeightString;
  String? _initialBloodType;
  List<Map<String, dynamic>> _initialAllergies = [];
  List<Map<String, dynamic>> _initialMedications = [];

  // Track jika data sudah di-load dari provider
  bool _dataLoaded = false;

  @override
  void initState() {
    super.initState();
    // Inisialisasi controllers dengan nilai default
    _nameController.addListener(_onControllerChanged);
    _phoneController.addListener(_onControllerChanged);
    _dobController.addListener(_onControllerChanged);
    _heightController.addListener(_onControllerChanged);
    _weightController.addListener(_onControllerChanged);
    _bloodTypeController.addListener(_onControllerChanged);
  }

  void _onControllerChanged() {
    // Setiap kali controller berubah, update UI
    if (_isEditing) {
      setState(() {});
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _loadInitialData();
  }

  void _loadInitialData() {
    final provider = Provider.of<ProfileProvider>(context, listen: false);
    
    if (!provider.isLoading && !_dataLoaded) {
      // Update controllers dengan data dari provider
      _nameController.text = provider.fullName;
      _phoneController.text = provider.phone ?? '';
      _dobController.text = provider.dateOfBirth?.toIso8601String().split('T').first ?? '';
      _heightController.text = provider.heightCm?.toString() ?? '';
      _weightController.text = provider.weightKg?.toString() ?? '';
      _bloodTypeController.text = provider.bloodType ?? '';
      _currentAllergies = List.from(provider.allergies);
      _currentMedications = List.from(provider.medications);
      
      _dataLoaded = true;
    }
  }

  @override
  void dispose() {
    _nameController.removeListener(_onControllerChanged);
    _phoneController.removeListener(_onControllerChanged);
    _dobController.removeListener(_onControllerChanged);
    _heightController.removeListener(_onControllerChanged);
    _weightController.removeListener(_onControllerChanged);
    _bloodTypeController.removeListener(_onControllerChanged);
    
    _nameController.dispose();
    _phoneController.dispose();
    _dobController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _bloodTypeController.dispose();
    super.dispose();
  }

  void _startEditing(ProfileProvider provider) {
    // Simpan nilai awal untuk perbandingan
    _initialName = provider.fullName;
    _initialPhone = provider.phone;
    _initialDobString = provider.dateOfBirth?.toIso8601String().split('T').first ?? '';
    _initialHeightString = provider.heightCm?.toString() ?? '';
    _initialWeightString = provider.weightKg?.toString() ?? '';
    _initialBloodType = provider.bloodType;
    _initialAllergies = List.from(provider.allergies);
    _initialMedications = List.from(provider.medications);
    
    // Update controllers dengan data terbaru
    _nameController.text = _initialName;
    _phoneController.text = _initialPhone ?? '';
    _dobController.text = _initialDobString!;
    _heightController.text = _initialHeightString!;
    _weightController.text = _initialWeightString!;
    _bloodTypeController.text = _initialBloodType ?? '';
    _currentAllergies = List.from(_initialAllergies);
    _currentMedications = List.from(_initialMedications);
    
    setState(() => _isEditing = true);
    
    print('=== START EDITING ===');
    print('Initial Name: $_initialName');
    print('Initial Phone: $_initialPhone');
    print('Initial DOB: $_initialDobString');
    print('Initial Height: $_initialHeightString');
    print('Initial Weight: $_initialWeightString');
    print('Initial Blood Type: $_initialBloodType');
    print('Initial Allergies: $_initialAllergies');
    print('Initial Medications: $_initialMedications');
    print('Current Name Ctrl: ${_nameController.text}');
  }

  void _cancelEditing() {
    setState(() => _isEditing = false);
  }

  bool _hasPersonalChanges() {
    final hasNameChange = _nameController.text.trim() != _initialName.trim();
    final hasPhoneChange = _phoneController.text.trim() != (_initialPhone?.trim() ?? '');
    final hasDobChange = _dobController.text.trim() != (_initialDobString?.trim() ?? '');
    
    final hasChanges = hasNameChange || hasPhoneChange || hasDobChange;
    
    if (hasChanges) {
      print('=== PERSONAL CHANGES DETECTED ===');
      print('Name: "$_initialName" -> "${_nameController.text}" ($hasNameChange)');
      print('Phone: "$_initialPhone" -> "${_phoneController.text}" ($hasPhoneChange)');
      print('DOB: "$_initialDobString" -> "${_dobController.text}" ($hasDobChange)');
    }
    
    return hasChanges;
  }

  bool _hasMedicalChanges() {
    final hasHeightChange = _heightController.text.trim() != (_initialHeightString?.trim() ?? '');
    final hasWeightChange = _weightController.text.trim() != (_initialWeightString?.trim() ?? '');
    final hasBloodTypeChange = _bloodTypeController.text.trim() != (_initialBloodType?.trim() ?? '');
    final hasAllergiesChange = _listsAreDifferent(_currentAllergies, _initialAllergies);
    final hasMedicationsChange = _listsAreDifferent(_currentMedications, _initialMedications);
    
    final hasChanges = hasHeightChange || hasWeightChange || hasBloodTypeChange || 
                      hasAllergiesChange || hasMedicationsChange;
    
    if (hasChanges) {
      print('=== MEDICAL CHANGES DETECTED ===');
      print('Height: "$_initialHeightString" -> "${_heightController.text}" ($hasHeightChange)');
      print('Weight: "$_initialWeightString" -> "${_weightController.text}" ($hasWeightChange)');
      print('Blood Type: "$_initialBloodType" -> "${_bloodTypeController.text}" ($hasBloodTypeChange)');
      print('Allergies changed: $hasAllergiesChange');
      print('Medications changed: $hasMedicationsChange');
    }
    
    return hasChanges;
  }

  bool _listsAreDifferent(List<Map<String, dynamic>> a, List<Map<String, dynamic>> b) {
    if (a.length != b.length) return true;
    for (int i = 0; i < a.length; i++) {
      final aName = (a[i]['name'] ?? '').toString().trim();
      final bName = (b[i]['name'] ?? '').toString().trim();
      if (aName != bName) return true;
    }
    return false;
  }

  bool _hasAnyChanges() {
    final hasPersonal = _hasPersonalChanges();
    final hasMedical = _hasMedicalChanges();
    final hasAny = hasPersonal || hasMedical;
    
    print('=== ANY CHANGES? ===');
    print('Personal: $hasPersonal');
    print('Medical: $hasMedical');
    print('Any: $hasAny');
    
    return hasAny;
  }

  Future<void> _saveAllChanges(BuildContext context) async {
    print('=== SAVING CHANGES ===');
    print('Has any changes: ${_hasAnyChanges()}');
    
    if (!_hasAnyChanges()) {
      print('No changes detected, canceling edit mode');
      _cancelEditing();
      return;
    }

    setState(() => _isSaving = true);

    final provider = Provider.of<ProfileProvider>(context, listen: false);
    bool personalSuccess = true;
    bool medicalSuccess = true;

    // Save personal info jika ada perubahan
    if (_hasPersonalChanges()) {
      print('Saving personal info...');
      personalSuccess = await provider.updateProfile(
        {},
        newFullName: _nameController.text.trim(),
        newPhone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null,
        newDateOfBirth: _dobController.text.trim().isNotEmpty 
            ? DateTime.parse(_dobController.text.trim())
            : null,
      );
      print('Personal save success: $personalSuccess');
    }

    // Save medical info jika ada perubahan
    if (_hasMedicalChanges()) {
      print('Saving medical info...');
      medicalSuccess = await provider.saveMedicalProfile(
        newHeightCm: _heightController.text.trim().isNotEmpty 
            ? int.tryParse(_heightController.text.trim())
            : null,
        newWeightKg: _weightController.text.trim().isNotEmpty
            ? int.tryParse(_weightController.text.trim())
            : null,
        newBloodType: _bloodTypeController.text.trim().isNotEmpty
            ? _bloodTypeController.text.trim()
            : null,
        newAllergies: _currentAllergies,
        newMedications: _currentMedications,
      );
      print('Medical save success: $medicalSuccess');
    }

    setState(() {
      _isSaving = false;
      if (personalSuccess && medicalSuccess) {
        // Update initial values dengan yang baru disimpan
        _initialName = _nameController.text.trim();
        _initialPhone = _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : null;
        _initialDobString = _dobController.text.trim().isNotEmpty ? _dobController.text.trim() : '';
        _initialHeightString = _heightController.text.trim();
        _initialWeightString = _weightController.text.trim();
        _initialBloodType = _bloodTypeController.text.trim().isNotEmpty ? _bloodTypeController.text.trim() : null;
        _initialAllergies = List.from(_currentAllergies);
        _initialMedications = List.from(_currentMedications);
        
        _isEditing = false;
        print('Edit mode closed successfully');
      }
    });

    if (!personalSuccess || !medicalSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal menyimpan beberapa perubahan'),
          backgroundColor: Colors.red,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Profil berhasil diperbarui'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  Widget _buildEditButtons(BuildContext context, ProfileProvider provider) {
    final hasChanges = _hasAnyChanges();
    
    if (!_isEditing) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const SectionTitle('Personal Information'),
          TextButton.icon(
            onPressed: () => _startEditing(provider),
            icon: const Icon(Icons.edit),
            label: const Text('Edit Profile'),
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).primaryColor,
            ),
          ),
        ],
      );
    }

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const SectionTitle('Personal Information'),
        Row(
          children: [
            TextButton(
              onPressed: _isSaving ? null : _cancelEditing,
              child: const Text('Cancel'),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: _isSaving || !hasChanges ? null : () => _saveAllChanges(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: hasChanges 
                    ? Theme.of(context).primaryColor
                    : Colors.grey[400],
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(hasChanges ? 'Save' : 'No Changes'),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<ProfileProvider>(
      builder: (_, provider, __) {
        if (provider.isLoading && !_isSaving) {
          return const Scaffold(body: ProfileSkeleton());
        }

        // Load data ke controllers saat provider berubah
        if (!_dataLoaded && !provider.isLoading) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              _loadInitialData();
            }
          });
        }

        return Scaffold(
          backgroundColor: theme.colorScheme.surface,
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                ProfileHeader(
                  isEditing: _isEditing,
                  name: provider.fullName,
                  email: provider.email,
                  avatarUrl: provider.userProfile,
                  onEdit: () => _startEditing(provider),
                ),
                const SizedBox(height: 32),

                // Header dengan tombol edit
                _buildEditButtons(context, provider),
                const SizedBox(height: 16),
                
                // Personal Info Section
                PersonalInfoSection(
                  isEditing: _isEditing,
                  nameController: _nameController,
                  email: provider.email,
                  phoneController: _phoneController,
                  dobController: _dobController,
                  initialName: provider.fullName,
                  initialPhone: provider.phone,
                  initialDob: provider.dateOfBirth,
                ),

                const SizedBox(height: 32),
                const SectionTitle('Medical Information'),
                const SizedBox(height: 16),
                
                // Medical Info Section
                MedicalInfoSection(
                  isEditing: _isEditing,
                  heightController: _heightController,
                  weightController: _weightController,
                  bloodTypeController: _bloodTypeController,
                  allergies: _currentAllergies,
                  medications: _currentMedications,
                  onAllergiesChanged: (allergies) {
                    setState(() {
                      _currentAllergies = allergies;
                      print('Allergies updated: $_currentAllergies');
                    });
                  },
                  onMedicationsChanged: (medications) {
                    setState(() {
                      _currentMedications = medications;
                      print('Medications updated: $_currentMedications');
                    });
                  },
                  initialHeight: provider.heightCm,
                  initialWeight: provider.weightKg,
                  initialBloodType: provider.bloodType,
                  initialAllergies: provider.allergies,
                  initialMedications: provider.medications,
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