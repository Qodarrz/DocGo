import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:docgo/app/routes.dart';

class HealthInputBlock extends StatefulWidget {
  const HealthInputBlock({super.key});

  @override
  State<HealthInputBlock> createState() => _HealthInputBlockState();
}

class _HealthInputBlockState extends State<HealthInputBlock> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _submit(String value) {
    if (value.trim().isEmpty) return;
    context.push(
      AppRoutes.diagnosis,
      extra: {'symptom': value.trim()},
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      color: colorScheme.primary,
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                textInputAction: TextInputAction.send,
                onSubmitted: _submit,
                decoration: const InputDecoration(
                  hintText: 'Ceritakan kondisi kamu hari ini...',
                  border: InputBorder.none,
                  isDense: true,
                  filled: true,
                  fillColor: Colors.white,
                ),
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: Colors.black),
              ),
            ),
            const SizedBox(width: 12),
            IconButton(
              onPressed: () => _submit(_controller.text),
              icon: const Icon(Icons.mic),
              style: IconButton.styleFrom(
                backgroundColor: colorScheme.primaryContainer,
                foregroundColor: colorScheme.onPrimaryContainer,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
