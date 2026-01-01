import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/reminder_provider.dart';
import 'reminder_list_screen.dart';
import 'reminder_form_screen.dart';

class ReminderScreen extends StatelessWidget {
  const ReminderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ReminderProvider()..loadReminders(),
      child: const _ReminderNavigator(),
    );
  }
}

class _ReminderNavigator extends StatelessWidget {
  const _ReminderNavigator();

  @override
  Widget build(BuildContext context) {
    return Navigator(
      onGenerateRoute: (settings) {
        if (settings.name == '/form') {
          final reminder = settings.arguments as Map<String, dynamic>?;
          return MaterialPageRoute(
            builder: (_) => ReminderFormScreen(reminder: reminder),
          );
        }

        return MaterialPageRoute(
          builder: (_) => const ReminderListScreen(),
        );
      },
    );
  }
}
