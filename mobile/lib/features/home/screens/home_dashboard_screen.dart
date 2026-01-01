import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';

import 'package:docgo/app/routes.dart';
import 'package:docgo/features/home/api/home_api.dart';
import 'package:docgo/features/home/api/home_provider.dart';
import 'package:docgo/features/home/widgets/home_app_bar.dart';
import 'package:docgo/features/home/widgets/health_input_block.dart';
import 'package:docgo/features/home/widgets/welcome_card.dart';
import 'package:docgo/features/home/widgets/home_video_grid.dart';

class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HomeProvider(api: HomeApi())..fetchHomeData(),
      child: Consumer<HomeProvider>(
        builder: (context, provider, _) {
          final theme = Theme.of(context);
          final colorScheme = theme.colorScheme;

          return Scaffold(
            backgroundColor: colorScheme.background,
            body: RefreshIndicator(
              onRefresh: provider.fetchHomeData,
              child: CustomScrollView(
                slivers: [
                  HomeAppBar(
                    onNotificationTap: () {},
                    onSettingsTap: () => context.push(AppRoutes.settings),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(20),
                    sliver: SliverList(
                      delegate: SliverChildListDelegate([
                        Text(
                          'Bagaimana keadaanmu\nsaat ini?',
                          style: theme.textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 12),
                        provider.isLoading
                            ? _shimmerBox(height: 60)
                            : const HealthInputBlock(),
                        const SizedBox(height: 20),
                        provider.isLoading
                            ? _shimmerBox(height: 120)
                            : const WelcomeCard(),
                        const SizedBox(height: 24),
                        Text(
                          'Video Edukasi',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ]),
                    ),
                  ),
                  HomeVideoGrid(provider: provider),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 80)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _shimmerBox({required double height}) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
