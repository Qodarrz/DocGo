import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:docgo/features/home/api/home_provider.dart';
import 'package:shimmer/shimmer.dart';

class HomeAppBar extends StatelessWidget {
  final VoidCallback onNotificationTap;
  final VoidCallback onSettingsTap;

  const HomeAppBar({
    super.key,
    required this.onNotificationTap,
    required this.onSettingsTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SliverAppBar(
      expandedHeight: 160,
      collapsedHeight: kToolbarHeight + 8,

      pinned: true,
      automaticallyImplyLeading: false,
      backgroundColor: colorScheme.background,
      surfaceTintColor: Colors.transparent,
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.pin,
        titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
        title: Consumer<HomeProvider>(
          builder: (context, provider, _) {
            Widget nameWidget;

            if (provider.isLoading) {
              // tampilkan skeleton sementara nama belum ada
              nameWidget = Shimmer.fromColors(
                baseColor: Colors.grey.shade300,
                highlightColor: Colors.grey.shade100,
                child: Container(width: 100, height: 16, color: Colors.white),
              );
            } else {
              final userName = provider.fullName.isNotEmpty
                  ? provider.fullName
                  : 'User';
              nameWidget = Text(
                'Hai, $userName',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).colorScheme.onBackground,
                ),
              );
            }

            return Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: Icon(
                    Icons.person,
                    color: Theme.of(context).colorScheme.onPrimary,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      greetingByTime(),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                    const SizedBox(height: 2),
                    nameWidget,
                  ],
                ),
              ],
            );
          },
        ),
      ),

      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          color: colorScheme.onBackground,
          onPressed: onNotificationTap,
        ),
        IconButton(
          icon: const Icon(Icons.settings_outlined),
          color: colorScheme.onBackground,
          onPressed: onSettingsTap,
        ),
      ],
    );
  }
}

String greetingByTime() {
  final hour = DateTime.now().hour;

  if (hour >= 5 && hour < 11) {
    return 'Selamat Pagi';
  } else if (hour >= 11 && hour < 15) {
    return 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat Sore';
  } else {
    return 'Selamat Malam';
  }
}
