import 'package:flutter/material.dart';

class AppColors {
  // Base Colors
  static const Color background = Color(0xFFFFFFFF); // white
  static const Color foreground = Color(0xFF252525); // dark text
  static const Color grey = Color(0xFF252525); // dark text
  
  // Blue Palette
  static const Color primary = Color(0xFF3B82F6); // blue-500
  static const Color primaryLight = Color(0xFF60A5FA); // blue-400
  static const Color primaryDark = Color(0xFF2563EB); // blue-600
  
  // Secondary / Accent
  static const Color secondary = Color(0xFF0EA5E9); // sky-500
  static const Color accent = Color(0xFF38BDF8); // sky-400
  
  // UI Colors
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF252525);
  static const Color popover = Color(0xFFFFFFFF);
  static const Color popoverForeground = Color(0xFF252525);
  static const Color secondaryForeground = Color(0xFF252525);
  static const Color muted = Color(0xFFF8F9FA);
  static const Color mutedForeground = Color(0xFF6B7280);
  static const Color accentForeground = Color(0xFF252525);
  static const Color destructive = Color(0xFFEF4444);
  static const Color border = Color(0xFFE5E7EB);
  static const Color input = Color(0xFFE5E7EB);
  static const Color ring = Color(0xFF9CA3AF);
  
  // Chart Colors
  static const Color chart1 = Color(0xFFF97316); // orange-500
  static const Color chart2 = Color(0xFF0D9488); // teal-600
  static const Color chart3 = Color(0xFF4F46E5); // indigo-600
  static const Color chart4 = Color(0xFFEAB308); // yellow-500
  static const Color chart5 = Color(0xFFDC2626); // red-600
  
  // Sidebar Colors
  static const Color sidebar = Color(0xFFFBFDFE);
  static const Color sidebarForeground = Color(0xFF252525);
  static const Color sidebarPrimary = Color(0xFF252525);
  static const Color sidebarPrimaryForeground = Color(0xFFFBFDFE);
  static const Color sidebarAccent = Color(0xFFF8FAFC);
  static const Color sidebarAccentForeground = Color(0xFF252525);
  static const Color sidebarBorder = Color(0xFFE5E7EB);
  static const Color sidebarRing = Color(0xFF9CA3AF);
  
  // Additional Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);
  
  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // Dark Mode Colors
  static const Color darkBackground = Color(0xFF0F172A); // slate-900
  static const Color darkForeground = Color(0xFFF8FAFC); // slate-50
  
  static const Color darkCard = Color(0xFF1E293B); // slate-800
  static const Color darkCardForeground = Color(0xFFF8FAFC);
  static const Color darkBorder = Color(0xFF334155); // slate-700
  static const Color darkMuted = Color(0xFF1E293B);
  static const Color darkMutedForeground = Color(0xFF94A3B8); // slate-400
}