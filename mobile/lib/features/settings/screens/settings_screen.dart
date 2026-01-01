import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:docgo/app/routes.dart';
import 'package:docgo/theme/theme_controller.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  List<Map<String, dynamic>> get settingsMenu => [
        {
          'title': 'Profile',
          'icon': Icons.person,
          'route': AppRoutes.profile,
        },
        {
          'title': 'Dark Mode',
          'icon': Icons.dark_mode,
          'isSwitch': true,
        },  
        {
          'title': 'Privacy',
          'icon': Icons.lock,
        },
        {
          'title': 'Help & Support',
          'icon': Icons.help_outline,
        },
        {
          'title': 'Logout',
          'icon': Icons.logout,
          'onTap': (BuildContext context) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Logged out successfully'),
              ),
            );
            context.go(AppRoutes.login);
          },
        },
      ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go(AppRoutes.home);
            }
          },
        ),
        title: Text(
          'Settings',
          style: textTheme.titleLarge,
        ),
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(vertical: 16),
          itemCount: settingsMenu.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, index) {
            final item = settingsMenu[index];
            final bool isSwitch = item['isSwitch'] == true;

            return ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 8,
              ),
              leading: Icon(
                item['icon'] as IconData,
                color: colorScheme.onSurface,
              ),
              title: Text(
                item['title'] as String,
                style: textTheme.bodyLarge,
              ),
              trailing: isSwitch
                  ? ValueListenableBuilder<ThemeMode>(
                      valueListenable: themeNotifier,
                      builder: (context, mode, _) {
                        return Switch(
                          value: mode == ThemeMode.dark,
                          onChanged: (value) {
                            final newMode = value
                                ? ThemeMode.dark
                                : ThemeMode.light;
                            themeNotifier.value = newMode;
                            ThemeController.saveTheme(newMode);
                          },
                        );
                      },
                    )
                  : Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: colorScheme.onSurface.withOpacity(0.4),
                    ),
              onTap: isSwitch
                  ? null
                  : () {
                      if (item.containsKey('route')) {
                        context.go(item['route'] as String);
                      } else if (item.containsKey('onTap')) {
                        item['onTap'](context);
                      }
                    },
            );
          },
        ),
      ),
    );
  }
}
