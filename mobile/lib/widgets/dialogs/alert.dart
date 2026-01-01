import 'package:flutter/material.dart';

enum AlertType { success, error, warning }

class AppAlert {
  static void show(
    BuildContext context, {
    required String message,
    AlertType type = AlertType.error,
  }) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;

    entry = OverlayEntry(
      builder: (_) => _AlertWidget(
        message: message,
        type: type,
        onClose: () => entry.remove(),
      ),
    );

    overlay.insert(entry);

    Future.delayed(const Duration(seconds: 3), () {
      if (entry.mounted) entry.remove();
    });
  }
}

class _AlertWidget extends StatelessWidget {
  final String message;
  final AlertType type;
  final VoidCallback onClose;

  const _AlertWidget({
    required this.message,
    required this.type,
    required this.onClose,
  });

  Color get _bgColor {
    switch (type) {
      case AlertType.success:
        return Colors.green.shade600;
      case AlertType.warning:
        return Colors.orange.shade600;
      case AlertType.error:
      default:
        return Colors.red.shade600;
    }
  }

  IconData get _icon {
    switch (type) {
      case AlertType.success:
        return Icons.check_circle;
      case AlertType.warning:
        return Icons.warning_amber_rounded;
      case AlertType.error:
      default:
        return Icons.error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 12,
      left: 16,
      right: 16,
      child: Material(
        color: Colors.transparent,
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: _bgColor,
            borderRadius: BorderRadius.circular(14),
            boxShadow: const [
              BoxShadow(
                blurRadius: 10,
                color: Colors.black26,
              ),
            ],
          ),
          child: Row(
            children: [
              Icon(_icon, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              GestureDetector(
                onTap: onClose,
                child: const Icon(
                  Icons.close,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
