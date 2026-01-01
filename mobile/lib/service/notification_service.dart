import 'dart:io';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class PushNotificationService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin
  _flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  // Notifikasi biasa
  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    description: 'This channel is used for important notifications.',
    importance: Importance.high,
  );

  // Reminder
  static const AndroidNotificationChannel reminderChannel =
      AndroidNotificationChannel(
        'reminder_channel',
        'Reminder Notifications',
        description: 'Channel for reminder alarms',
        importance: Importance.max,
        playSound: true,
        sound: RawResourceAndroidNotificationSound(
          'alarm_sound',
        ), // letakkan mp3 di android/res/raw/
        enableVibration: true,
      );

  /// Init FCM + Local Notifications
  static Future<void> init() async {
    try {
      if (Platform.isAndroid || Platform.isIOS) {
        final settings = await _fcm.requestPermission(
          alert: true,
          badge: true,
          sound: true,
        );
        if (settings.authorizationStatus == AuthorizationStatus.denied) {
          print('FCM Permission Denied');
          return;
        }
      }

      await _initLocalNotifications();

      final token = await _fcm.getToken();
      if (token != null) print('FCM TOKEN DEBUG: $token');

      _fcm.onTokenRefresh.listen((newToken) async {
        print('FCM TOKEN REFRESHED: $newToken');
      });
    } catch (e) {
      print('FCM init error: $e');
    }
  }

  static Future<String?> getToken() async {
    try {
      return await _fcm.getToken();
    } catch (e) {
      print('Error getting FCM token: $e');
      return null;
    }
  }

  /// Local notifications init
  static Future<void> _initLocalNotifications() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    final InitializationSettings initializationSettings =
        InitializationSettings(
          android: androidSettings,
          iOS: null,
          macOS: null,
        );

    await _flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (details) async {
        print('Notification tapped: ${details.payload}');
      },
    );

    await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(_channel);

    await _flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(reminderChannel);
  }

  /// Listener FCM
  static void listen() {
    FirebaseMessaging.onMessage.listen((message) async {
      print('==== Foreground FCM ====');
      print('From: ${message.from}');
      print('Notification: ${message.notification}');
      print('Data: ${message.data}');

      final data = message.data;
      final type = data['type'] ?? 'NORMAL';
      final int reminderId = int.tryParse(data['reminderId'] ?? '0') ?? 0;

      if (type == 'REMINDER') {
        await showReminder(
          reminderId: reminderId,
          title: message.notification?.title ?? data['title'] ?? 'Reminder',
          body: message.notification?.body ?? data['body'] ?? '',
        );
      } else {
        RemoteNotification? notification = message.notification;
        if (notification != null) {
          await _flutterLocalNotificationsPlugin.show(
            notification.hashCode,
            notification.title,
            notification.body,
            NotificationDetails(
              android: AndroidNotificationDetails(
                _channel.id,
                _channel.name,
                channelDescription: _channel.description,
                importance: Importance.max,
                priority: Priority.high,
              ),
            ),
            payload: data.toString(),
          );
        }
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      print('FCM onMessageOpenedApp: ${message.notification?.title}');
      print('Data: ${message.data}');
    });
  }

  /// Tampilkan reminder full-screen
  static Future<void> showReminder({
    required int reminderId,
    required String title,
    required String body,
  }) async {
    await _flutterLocalNotificationsPlugin.show(
      reminderId,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          reminderChannel.id,
          reminderChannel.name,
          channelDescription: reminderChannel.description,
          importance: Importance.max,
          priority: Priority.high,
          fullScreenIntent: true,
          playSound: true,
          sound: RawResourceAndroidNotificationSound('alarm_sound'),
          enableVibration: true,
          actions: [AndroidNotificationAction('STOP_REMINDER', 'Stop')],
        ),
      ),
      payload: reminderId.toString(),
    );
  }

  static Future<void> stopReminder(int reminderId) async {
    await _flutterLocalNotificationsPlugin.cancel(reminderId);
  }
}
