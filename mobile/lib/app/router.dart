import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:docgo/app/app_shell.dart';
import 'package:docgo/app/routes.dart';

import 'package:docgo/features/splash/screens/splash_screen.dart';
import 'package:docgo/features/splash/screens/onboarding.dart';
import 'package:docgo/features/auth/screens/login_screen.dart';
import 'package:docgo/features/auth/screens/register_screen.dart';
import 'package:docgo/features/auth/screens/email_verification_screen.dart';

import 'package:docgo/features/home/screens/home_dashboard_screen.dart';
import 'package:docgo/features/home/screens/video_detail_screen.dart';

import 'package:docgo/features/diagnosis/screens/diagnosis_form_screen.dart';
import 'package:docgo/features/diagnosis/screens/diagnosis_result_screen.dart';

import 'package:docgo/features/profile/screens/profile_screen.dart';
import 'package:docgo/features/settings/screens/settings_screen.dart';
import 'package:docgo/features/reminders/screens/reminder_screen.dart';

import 'package:docgo/features/consultation/screens/consultation_screen.dart';
import 'package:docgo/features/consultation/screens/consultation_detail_screen.dart';
import 'package:docgo/features/consultation/screens/chat_screen.dart';

import 'package:docgo/features/consultation/api/consultation_api.dart';
import 'package:docgo/features/consultation/api/consultation_provider.dart';

import 'package:docgo/network/api_urls.dart';
import 'package:http/http.dart' as http;


class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.splash,

    routes: [
      // ================= SPLASH & AUTH =================
      GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(path: AppRoutes.login, builder: (_, __) => const LoginScreen()),
      GoRoute(
        path: AppRoutes.register,
        builder: (_, __) => const RegisterScreen(),
      ),
      GoRoute(
        path: AppRoutes.emailVerification,
        builder: (_, state) {
          final email = state.extra as String?;
          if (email == null) {
            return const Scaffold(body: Center(child: Text('Email missing')));
          }
          return EmailVerificationScreen(email: email);
        },
      ),

      // ================= DETAIL OUTSIDE SHELL =================
      GoRoute(
        path: AppRoutes.videoDetail,
        builder: (_, state) {
          final video = state.extra as Map<String, dynamic>?;
          if (video == null) {
            return const Scaffold(
              body: Center(child: Text('Video data missing')),
            );
          }
          return VideoDetailScreen(video: video);
        },
      ),
      GoRoute(
        path: '${AppRoutes.consultation}/detail',
        builder: (_, state) {
          final data = state.extra as Map<String, dynamic>?;
          if (data == null) {
            return const Scaffold(
              body: Center(child: Text('Doctor data missing')),
            );
          }

          return ConsultationDetailScreen(
            doctorId: data['doctorId']?.toString() ?? '',
            name: data['name'] ?? '-',
            specialist: data['specialist'] ?? '-',
            institution: data['institution'] ?? '-',
            rating: (data['rating'] as num?)?.toDouble() ?? 0.0,
            reviews: (data['reviews'] as num?)?.toInt() ?? 0,
            image: data['image'] ?? '',
          );
        },
      ),
      GoRoute(
        path: AppRoutes.consultationChat,
        builder: (_, state) {
          final data = state.extra as Map<String, dynamic>?;
          if (data == null) {
            return const Scaffold(
              body: Center(child: Text('Chat data missing')),
            );
          }

          return ChatScreen(
            userId: data['userId'],
            chatRoomId: data['chatRoomId'],
            userType: data['userType'],
          );
        },
      ),
      GoRoute(
        path: AppRoutes.diagnosisresult,
        builder: (_, state) {
          final data = state.extra as Map<String, dynamic>?;
          if (data == null) {
            return const Scaffold(
              body: Center(child: Text('Diagnosis data missing')),
            );
          }
          return DiagnosisResultScreen(data: data);
        },
      ),

      // ================= SHELL (BOTTOM NAV) =================
      ShellRoute(
        builder: (context, state, child) {
          return ChangeNotifierProvider<ConsultProvider>(
            create: (_) => ConsultProvider(
              api: ConsultApi(baseUrl: ApiUrls.baseUrl, client: http.Client()),
            )..fetchDoctorsList(),
            child: AppShell(child: child),
          );
        },
        routes: [
          GoRoute(
            path: AppRoutes.home,
            builder: (_, __) => const HomeDashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.consultation,
            builder: (_, __) => const ConsultationScreen(),
          ),
          GoRoute(
            path: AppRoutes.diagnosis,
            builder: (_, state) {
              final extra = state.extra as Map<String, dynamic>?;
              return DiagnosisFormScreen(initialSymptom: extra?['symptom']);
            },
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (_, __) => const ProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.settings,
            builder: (_, __) => const SettingsScreen(),
          ),
          GoRoute(
            path: AppRoutes.reminder,
            builder: (_, __) => ReminderScreen(),
          ),
        ],
      ),
    ],

    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('No route defined for ${state.uri}')),
    ),
  );
}
