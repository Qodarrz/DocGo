import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:docgo/network/api_urls.dart';
import 'package:http/http.dart' as http;
import 'firebase_options.dart';
import 'package:docgo/app/auth_provider.dart';
import 'package:docgo/features/consultation/api/consultation_provider.dart';
import 'package:docgo/features/consultation/api/consultation_api.dart';
import 'package:docgo/app/app.dart';
import 'package:docgo/theme/theme_controller.dart';
import 'package:docgo/service/notification_service.dart';
import 'package:docgo/service/backgroundhandler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  await ThemeController.loadTheme();

  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

  await PushNotificationService.init();
  PushNotificationService.listen();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          lazy: false,
        ),
        ChangeNotifierProvider<ConsultProvider>(
          create: (_) => ConsultProvider(
            api: ConsultApi(
              baseUrl: ApiUrls
                  .baseUrl, // pastikan ApiUrls sudah didefinisikan di api_urls.dart
              client: http.Client(),
            ),
          )..fetchDoctorsList(),
          lazy: false,
        ),

        // Tambahkan provider lain di sini
      ],
      child: const MyAppContent(),
    );
  }
}
