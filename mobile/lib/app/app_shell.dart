import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Interface untuk halaman yang bisa di-refresh
abstract class RefreshablePage {
  Future<void> onRefresh();
}

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();

    if (location.startsWith('/home')) return 0;
    if (location.startsWith('/consultation')) return 1;
    if (location.startsWith('/diagnosis')) return 2;
    if (location.startsWith('/profile')) return 3;
    if (location.startsWith('/reminder')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/consultation');
        break;
      case 2:
        context.go('/diagnosis');
        break;
      case 3:
        context.go('/profile');
        break;
      case 4:
        context.go('/reminder');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.background,
      body: RefreshIndicator(
        onRefresh: () async {
          if (child is RefreshablePage) {
            await (child as RefreshablePage).onRefresh();
          }
        },
        child: child, // jangan bungkus dengan SingleChildScrollView lagi
      ),

      bottomNavigationBar: _ModernNavBar(
        currentIndex: _currentIndex(context),
        onTap: (index) => _onTap(context, index),
        theme: theme,
      ),
    );
  }
}

class _ModernNavBar extends StatefulWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final ThemeData theme;

  const _ModernNavBar({
    required this.currentIndex,
    required this.onTap,
    required this.theme,
  });

  @override
  State<_ModernNavBar> createState() => _ModernNavBarState();
}

class _ModernNavBarState extends State<_ModernNavBar> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.currentIndex;
  }

  @override
  void didUpdateWidget(covariant _ModernNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.currentIndex != oldWidget.currentIndex) {
      setState(() {
        _selectedIndex = widget.currentIndex;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = widget.theme.colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _NavBarItem(
            index: 0,
            currentIndex: _selectedIndex,
            icon: Icons.home_outlined,
            activeIcon: Icons.home_filled,
            label: 'Home',
            onTap: widget.onTap,
            theme: widget.theme,
          ),
          _NavBarItem(
            index: 1,
            currentIndex: _selectedIndex,
            icon: Icons.chat_bubble_outline,
            activeIcon: Icons.chat_bubble,
            label: 'Consult',
            onTap: widget.onTap,
            theme: widget.theme,
          ),
          _NavBarItem(
            index: 2,
            currentIndex: _selectedIndex,
            icon: Icons.health_and_safety_outlined,
            activeIcon: Icons.health_and_safety,
            label: 'Diagnosis',
            onTap: widget.onTap,
            theme: widget.theme,
          ),
          _NavBarItem(
            index: 3,
            currentIndex: _selectedIndex,
            icon: Icons.person_outline,
            activeIcon: Icons.person_2,
            label: 'Profile',
            onTap: widget.onTap,
            theme: widget.theme,
          ),
          _NavBarItem(
            index: 4,
            currentIndex: _selectedIndex,
            icon: Icons.notifications_outlined,
            activeIcon: Icons.notifications,
            label: 'Reminder',
            onTap: widget.onTap,
            theme: widget.theme,
          ),
        ],
      ),
    );
  }
}

class _NavBarItem extends StatefulWidget {
  final int index;
  final int currentIndex;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final ValueChanged<int> onTap;
  final ThemeData theme;

  const _NavBarItem({
    required this.index,
    required this.currentIndex,
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.onTap,
    required this.theme,
  });

  @override
  State<_NavBarItem> createState() => _NavBarItemState();
}

class _NavBarItemState extends State<_NavBarItem>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    );

    _scaleAnimation =
        TweenSequence<double>([
          TweenSequenceItem(
            tween: Tween<double>(begin: 1.0, end: 0.9),
            weight: 0.5,
          ),
          TweenSequenceItem(
            tween: Tween<double>(begin: 0.9, end: 1.1),
            weight: 0.5,
          ),
        ]).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeInOut,
          ),
        );

    _fadeAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _slideAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    if (widget.index == widget.currentIndex) {
      _animationController.forward();
    }
  }

  @override
  void didUpdateWidget(covariant _NavBarItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.index == widget.currentIndex &&
        oldWidget.index != widget.currentIndex) {
      _animationController.forward(from: 0);
    } else if (widget.index != widget.currentIndex &&
        oldWidget.index == widget.currentIndex) {
      _animationController.reverse();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = widget.theme.colorScheme;
    final isActive = widget.index == widget.currentIndex;

    return GestureDetector(
      onTap: () => widget.onTap(widget.index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Container(
            constraints: const BoxConstraints(minWidth: 64),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Background container with gradient
                Container(
                  width: 48,
                  height: 32,
                  decoration: BoxDecoration(
                    gradient: isActive
                        ? LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              cs.primary.withOpacity(0.2),
                              cs.primary.withOpacity(0.05),
                            ],
                          )
                        : null,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Active indicator background
                      if (isActive)
                        AnimatedOpacity(
                          duration: const Duration(milliseconds: 200),
                          opacity: _slideAnimation.value,
                          child: Container(
                            width: 40,
                            height: 32,
                            decoration: BoxDecoration(
                              color: cs.primary.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),

                      // Active indicator dot with slide animation
                      if (isActive)
                        Positioned(
                          top: 6,
                          child: Transform.translate(
                            offset: Offset(0, 2 * (1 - _slideAnimation.value)),
                            child: AnimatedOpacity(
                              duration: const Duration(milliseconds: 200),
                              opacity: _slideAnimation.value,
                              child: Container(
                                width: 4,
                                height: 4,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: cs.primary,
                                  boxShadow: [
                                    BoxShadow(
                                      color: cs.primary.withOpacity(0.4),
                                      blurRadius: 4,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                      // Icon with scale animation
                      Transform.scale(
                        scale: _scaleAnimation.value,
                        child: Icon(
                          isActive ? widget.activeIcon : widget.icon,
                          size: 22,
                          color: isActive
                              ? cs.primary
                              : cs.onSurface.withOpacity(_fadeAnimation.value),
                          shadows: isActive
                              ? [
                                  BoxShadow(
                                    color: cs.primary.withOpacity(0.3),
                                    blurRadius: 8,
                                    spreadRadius: 1,
                                  ),
                                ]
                              : null,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),

                // Label with smooth animation
                AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 200),
                  style: widget.theme.textTheme.labelSmall!.copyWith(
                    fontSize: 11,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    color: isActive
                        ? cs.primary
                        : cs.onSurface.withOpacity(0.7),
                    letterSpacing: isActive ? 0.3 : 0.0,
                    height: 1.2,
                  ),
                  child: Text(widget.label, textAlign: TextAlign.center),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
