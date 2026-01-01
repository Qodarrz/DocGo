import 'package:firebase_messaging/firebase_messaging.dart';
import 'dart:io';
import 'notification_service.dart';


@pragma('vm:entry-point')
/// Background handler
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('==== Background FCM ====');
  print('RemoteMessage: $message');
  print('From: ${message.from}');
  print('Data: ${message.data}');
  print('Notification: ${message.notification}');
  
  final data = message.data;
  final type = data['type'] ?? 'NORMAL';
  final int reminderId = int.tryParse(data['reminderId'] ?? '0') ?? 0;

  if (type == 'REMINDER' && Platform.isAndroid) {
    await PushNotificationService.showReminder(
      reminderId: reminderId,
      title: data['title'] ?? 'Reminder',
      body: data['body'] ?? '',
    );
    print('Reminder shown in background/terminated: $reminderId');
  }
}
