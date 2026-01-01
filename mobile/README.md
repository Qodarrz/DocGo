# 📱 DocGo Mobile App

![Flutter](https://img.shields.io/badge/Flutter-%2302569B.svg?style=for-the-badge&logo=Flutter&logoColor=white)
![Dart](https://img.shields.io/badge/dart-%230175C2.svg?style=for-the-badge&logo=dart&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)

The patient-facing mobile application for the DocGo platform, delivering quality healthcare to your fingertips.

## 📱 Features

-   **User Friendly**: Clean and intuitive UI built with Flutter.
-   **Appointment Booking**: Easy scheduling with doctors.
-   **Chat Consultations**: Realtime chatting.
-   **Health Tracking**: Monitor vital statistics.
-   **Push Notifications**: Timely reminders for appointments and medications.

## 🛠️ Tech Stack

-   **Framework**: Flutter (SDK ^3.10.0)
-   **State Management**: Provider
-   **Navigation**: GoRouter
-   **Local Storage**: Shared Preferences

## 🚀 Getting Started

### Prerequisites

-   Flutter SDK
-   Android Studio (for Android)
-   Xcode (for iOS - macOS only)

    ### Installation

1.  **Enter directory**
    ```bash
    cd mobile
    ```

2.  **Get Packages**
    ```bash
    flutter pub get
    ```

3.  **Run Application**

    *Debug Mode:*
    ```bash
    flutter run
    ```

    *Profile Mode (Performance Testing):*
    ```bash
    flutter run --profile
    ```

### 📦 Building for Production

**Android (APK)**
```bash
flutter build apk --release
```

**Android (App Bundle)**
```bash
flutter build appbundle --release
```

**iOS (IPA)**
```bash
flutter build ipa --release
```

## 📂 Project Structure

```
mobile/
├── lib/
│   ├── features/       # Feature-first architecture
│   ├── core/           # Core utilities & configs
│   └── shared/         # Shared widgets & models
├── assets/             # Images, Icons, Fonts
├── android/            # Native Android code
└── ios/                # Native iOS code
```

---
*Back to [Root Documentation](../README.md)*
