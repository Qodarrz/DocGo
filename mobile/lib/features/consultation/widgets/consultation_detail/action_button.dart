import 'package:flutter/material.dart';

class ActionButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isChat;

  const ActionButton.chat({
    super.key,
    required this.onPressed,
  }) : isChat = true;

  const ActionButton.book({
    super.key,
    required this.onPressed,
  }) : isChat = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isChat ? Colors.green : Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 4,
          shadowColor: Theme.of(context).colorScheme.shadow.withOpacity(0.3),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isChat ? Icons.chat : Icons.event_available),
            const SizedBox(width: 8),
            Text(
              isChat ? 'Mulai Chat' : 'Booking Konsultasi',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }
}