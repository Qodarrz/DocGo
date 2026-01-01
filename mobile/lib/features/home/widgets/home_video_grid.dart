import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:go_router/go_router.dart';

import 'package:docgo/app/routes.dart';
import 'package:docgo/features/home/api/home_provider.dart';
import 'package:docgo/features/home/widgets/video_card.dart';

class HomeVideoGrid extends StatelessWidget {
  final HomeProvider provider;

  const HomeVideoGrid({super.key, required this.provider});

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      sliver: SliverGrid(
        gridDelegate:
            const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 0.8,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            if (provider.isLoading) {
              return Shimmer.fromColors(
                baseColor: Colors.grey.shade300,
                highlightColor: Colors.grey.shade100,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              );
            }

            final video = provider.videos[index];
            return VideoCard(
              video: video,
              onTap: () => context.push(
                AppRoutes.videoDetail,
                extra: video,
              ),
            );
          },
          childCount:
              provider.isLoading ? 4 : provider.videos.length,
        ),
      ),
    );
  }
}
