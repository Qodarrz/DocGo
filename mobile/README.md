# Mobile - DocGo

This is the mobile application for DocGo, built with Flutter.

## Tech Stack

-   **Framework:** Flutter (SDK ^3.10.0)
-   **Navigation:** GoRouter
-   **State Management:** Provider
-   **Networking:** Http, Socket.io Client
-   **Notifications:** Firebase Messaging, Flutter Local Notifications
-   **WebView:** Flutter InAppWebView
-   **Video:** Youtube Player Flutter
-   **Background Processing:** Workmanager, Android Alarm Manager Plus

## Prerequisites

-   Flutter SDK
-   Android Studio / Xcode (for simulators/emulators)
-   CocoaPods (for iOS)

## Installation

1.  Navigate to the mobile folder:
    ```bash
    cd mobile
    ```

2.  Get dependencies:
    ```bash
    flutter pub get
    ```

## Running the Application

### Development

Run on a connected device or emulator:

```bash
flutter run
```

### Build

To build an APK:

```bash
flutter build apk
```

## Folder Structure

-   `lib/`: Main Dart code
-   `assets/`: Images, icons, and fonts
-   `android/`: Android native code
-   `ios/`: iOS native code
