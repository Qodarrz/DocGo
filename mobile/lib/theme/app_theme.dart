import 'package:flutter/material.dart';
import 'colors.dart';
import 'text_styles.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      fontFamily: 'SFProDisplay',

      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.background,
        background: AppColors.background,
        error: AppColors.destructive,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.foreground,
        onBackground: AppColors.foreground,
        onError: Colors.white,
      ),

      textTheme: const TextTheme(
        displayLarge: AppTextStyles.displayLarge,
        displayMedium: AppTextStyles.displayMedium,
        displaySmall: AppTextStyles.displaySmall,
        headlineLarge: AppTextStyles.headlineLarge,
        headlineMedium: AppTextStyles.headlineMedium,
        headlineSmall: AppTextStyles.headlineSmall,
        titleLarge: AppTextStyles.titleLarge,
        titleMedium: AppTextStyles.titleMedium,
        titleSmall: AppTextStyles.titleSmall,
        bodyLarge: AppTextStyles.bodyLarge,
        bodyMedium: AppTextStyles.bodyMedium,
        bodySmall: AppTextStyles.bodySmall,
        labelLarge: AppTextStyles.labelLarge,
        labelMedium: AppTextStyles.labelMedium,
        labelSmall: AppTextStyles.labelSmall,
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.muted,
        hintStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.mutedForeground,
        ),
        border: _inputBorder(),
        enabledBorder: _inputBorder(),
        focusedBorder: _inputBorder(
          color: AppColors.primary,
        ),
        errorBorder: _inputBorder(
          color: AppColors.destructive,
        ),
        focusedErrorBorder: _inputBorder(
          color: AppColors.destructive,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),

      elevatedButtonTheme: _elevatedButtonTheme(
        background: AppColors.primary,
        foreground: Colors.white,
      ),

      outlinedButtonTheme: _outlinedButtonTheme(
        color: AppColors.primary,
      ),

      textButtonTheme: _textButtonTheme(
        color: AppColors.primary,
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: AppTextStyles.titleLarge,
        toolbarHeight: 64,
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.background,
        elevation: 0,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.mutedForeground,
        type: BottomNavigationBarType.fixed,
      ),

      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),

      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
      ),

      chipTheme: _chipTheme(
        background: AppColors.muted,
        label: AppColors.foreground,
        selected: AppColors.primary,
        selectedLabel: Colors.white,
        brightness: Brightness.light,
      ),

      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.muted,
      ),
    );
  }

  // =======================
  // DARK THEME
  // =======================
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: 'SFProDisplay',

      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.darkBackground,
        background: AppColors.darkBackground,
        error: AppColors.destructive,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: AppColors.darkForeground,
        onBackground: AppColors.darkForeground,
        onError: Colors.white,
      ),

      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge.copyWith(
          color: AppColors.darkForeground,
        ),
        displayMedium: AppTextStyles.displayMedium.copyWith(
          color: AppColors.darkForeground,
        ),
        displaySmall: AppTextStyles.displaySmall.copyWith(
          color: AppColors.darkForeground,
        ),
        headlineLarge: AppTextStyles.headlineLarge.copyWith(
          color: AppColors.darkForeground,
        ),
        headlineMedium: AppTextStyles.headlineMedium.copyWith(
          color: AppColors.darkForeground,
        ),
        headlineSmall: AppTextStyles.headlineSmall.copyWith(
          color: AppColors.darkForeground,
        ),
        titleLarge: AppTextStyles.titleLarge.copyWith(
          color: AppColors.darkForeground,
        ),
        titleMedium: AppTextStyles.titleMedium.copyWith(
          color: AppColors.darkForeground,
        ),
        titleSmall: AppTextStyles.titleSmall.copyWith(
          color: AppColors.darkForeground,
        ),
        bodyLarge: AppTextStyles.bodyLarge.copyWith(
          color: AppColors.darkForeground,
        ),
        bodyMedium: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.darkMutedForeground,
        ),
        bodySmall: AppTextStyles.bodySmall.copyWith(
          color: AppColors.darkMutedForeground,
        ),
        labelLarge: AppTextStyles.labelLarge.copyWith(
          color: AppColors.darkForeground,
        ),
        labelMedium: AppTextStyles.labelMedium.copyWith(
          color: AppColors.darkMutedForeground,
        ),
        labelSmall: AppTextStyles.labelSmall.copyWith(
          color: AppColors.darkMutedForeground,
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkMuted,
        hintStyle: AppTextStyles.bodyMedium.copyWith(
          color: AppColors.darkMutedForeground,
        ),
        border: _inputBorder(),
        enabledBorder: _inputBorder(),
        focusedBorder: _inputBorder(
          color: AppColors.primary,
        ),
        errorBorder: _inputBorder(
          color: AppColors.destructive,
        ),
        focusedErrorBorder: _inputBorder(
          color: AppColors.destructive,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
      ),

      elevatedButtonTheme: _elevatedButtonTheme(
        background: AppColors.primary,
        foreground: Colors.white,
      ),

      outlinedButtonTheme: _outlinedButtonTheme(
        color: AppColors.primary,
      ),

      textButtonTheme: _textButtonTheme(
        color: AppColors.primary,
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        titleTextStyle: AppTextStyles.titleLarge,
        toolbarHeight: 64,
      ),

      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.darkMutedForeground,
        type: BottomNavigationBarType.fixed,
      ),

      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),

      dividerTheme: const DividerThemeData(
        color: AppColors.darkBorder,
        thickness: 1,
      ),

      chipTheme: _chipTheme(
        background: AppColors.darkMuted,
        label: AppColors.darkForeground,
        selected: AppColors.primary,
        selectedLabel: Colors.white,
        brightness: Brightness.dark,
      ),

      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
        linearTrackColor: AppColors.darkMuted,
      ),
    );
  }

  // =======================
  // SHARED HELPERS
  // =======================
  static OutlineInputBorder _inputBorder({Color? color}) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: color == null
          ? BorderSide.none
          : BorderSide(color: color, width: 2),
    );
  }

  static ElevatedButtonThemeData _elevatedButtonTheme({
    required Color background,
    required Color foreground,
  }) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: background,
        foregroundColor: foreground,
        textStyle: AppTextStyles.buttonMedium,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 0,
      ),
    );
  }

  static OutlinedButtonThemeData _outlinedButtonTheme({
    required Color color,
  }) {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        textStyle: AppTextStyles.buttonMedium,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        side: BorderSide(color: color),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  static TextButtonThemeData _textButtonTheme({
    required Color color,
  }) {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: color,
        textStyle: AppTextStyles.buttonMedium,
      ),
    );
  }

  static ChipThemeData _chipTheme({
    required Color background,
    required Color label,
    required Color selected,
    required Color selectedLabel,
    required Brightness brightness,
  }) {
    return ChipThemeData(
      backgroundColor: background,
      selectedColor: selected,
      labelStyle: AppTextStyles.labelMedium.copyWith(color: label),
      secondaryLabelStyle:
          AppTextStyles.labelMedium.copyWith(color: selectedLabel),
      brightness: brightness,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
