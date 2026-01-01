import 'package:flutter/material.dart';

class VideoCard extends StatelessWidget {
  final Map<String, dynamic> video;
  final VoidCallback onTap;
  final double width; // Tambahkan parameter width untuk carousel

  const VideoCard({
    super.key,
    required this.video,
    required this.onTap,
    this.width = 300, // Default width untuk carousel
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final thumbnailUrl =
        video['thumbnail']?.replaceAll('_webp', '') ??
        'https://img.youtube.com/vi/${video['id']}/0.jpg';

    return SizedBox(
      width: width, // Fixed width untuk carousel
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Card(
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Thumbnail dengan aspect ratio 16:9
              AspectRatio(
                aspectRatio: 4 / 3,

                child: Image.network(
                  thumbnailUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: Colors.grey[300],
                    child: const Center(
                      child: Icon(
                        Icons.broken_image,
                        color: Colors.grey,
                        size: 40,
                      ),
                    ),
                  ),
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: Colors.grey[300],
                      child: const Center(child: CircularProgressIndicator()),
                    );
                  },
                ),
              ),

              // Content
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      video['title'] ?? '',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        height: 1.3,
                      ),
                    ),

                    // Optional: Channel name and views
                    const SizedBox(height: 4),
                    Text(
                      video['channel'] ?? 'Unknown Channel',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
