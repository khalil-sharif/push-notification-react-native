# Push Notification React Native

Production-ready push notification system built with React Native, Firebase Cloud Messaging (FCM), and Notifee.

![React Native](https://img.shields.io/badge/React%20Native-0.76+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FCM%2020.x-FFCA28?logo=firebase)
![License](https://img.shields.io/badge/License-MIT-green)

## Screenshots

| Home | Notification Center | Preferences |
|------|-------------------|-------------|
| ![Home](docs/screenshots/home.png) | ![Center](docs/screenshots/notification-center.png) | ![Preferences](docs/screenshots/preferences.png) |

## Architecture

```
src/
├── App.tsx                          # Root component
├── types/
│   └── notification.ts              # TypeScript interfaces
├── utils/
│   ├── storage.ts                   # MMKV wrapper
│   ├── deepLink.ts                  # Deep link parser
│   ├── quietHours.ts                # Quiet hours logic
│   └── badge.ts                     # Badge count management
├── store/
│   └── notificationStore.ts         # Zustand store (persisted via MMKV)
├── services/
│   ├── NotificationService.ts       # Singleton — FCM, Notifee, topics, scheduling
│   └── NotificationChannels.ts      # Android channel definitions
├── hooks/
│   └── useNotificationSetup.ts      # Init hook for navigation context
├── components/
│   ├── NotificationItem.tsx         # Notification list row
│   └── NotificationBadge.tsx        # Bell icon with unread count
├── screens/
│   ├── HomeScreen.tsx               # Demo actions
│   ├── NotificationCenterScreen.tsx # In-app notification list
│   ├── NotificationPreferencesScreen.tsx # Category toggles + quiet hours
│   └── OrderDetailScreen.tsx        # Deep link target example
└── navigation/
    ├── RootNavigator.tsx            # Stack navigator + deep linking config
    └── types.ts                     # Navigation type definitions
```

## Features

- **FCM Integration** — Token registration, refresh handling, APNs support on iOS
- **Remote Notifications** — Foreground display via Notifee, background processing, quit-state deep links
- **Local Notifications** — Display, schedule (timestamp & interval), cancel, list pending
- **Deep Linking** — Notification press → navigate to screen with params (foreground, background, quit)
- **Rich Notifications** — BigPictureStyle, BigTextStyle, action buttons (Android); attachments, categories (iOS)
- **Notification Channels** — Orders (HIGH), Chat (HIGH), Promotions (DEFAULT), General (DEFAULT)
- **Badge Count** — iOS & Android badge management, auto-clear on app open
- **In-App Notification Center** — FlatList with read/unread indicators, swipe-to-delete, mark all as read, pull-to-refresh
- **Topic Subscriptions** — Subscribe/unsubscribe per category via FCM topics
- **Notification Preferences** — Per-category toggles synced with FCM topics + MMKV persistence
- **Quiet Hours** — Suppress display during configured hours (notifications still stored)
- **Notification Grouping** — Android group and groupSummary support

## Setup

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode 15+ (iOS)
- Android Studio (Android)
- Firebase project

### 1. Install Dependencies

```bash
npm install
cd ios && pod install && cd ..
```

### 2. Firebase Setup

#### Android

1. Go to [Firebase Console](https://console.firebase.google.com/) → Project Settings → Add Android app
2. Download `google-services.json`
3. Place it in `android/app/google-services.json`
4. Ensure `android/build.gradle` has:
   ```groovy
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.4.2'
     }
   }
   ```
5. Ensure `android/app/build.gradle` has:
   ```groovy
   apply plugin: 'com.google.gms.google-services'
   ```

#### iOS

1. Firebase Console → Project Settings → Add iOS app
2. Download `GoogleService-Info.plist`
3. Add it to your Xcode project (drag into the project navigator)
4. In `AppDelegate.mm`, add:
   ```objc
   #import <Firebase.h>

   - (BOOL)application:(UIApplication *)application
     didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
     [FIRApp configure];
     // ...existing code
   }
   ```

### 3. APNs Setup (iOS)

1. Apple Developer Portal → Certificates, Identifiers & Profiles
2. Create an APNs Key (Keys → + → Apple Push Notifications service)
3. Download the `.p8` file
4. Firebase Console → Project Settings → Cloud Messaging → iOS app → Upload APNs auth key
5. In Xcode: Target → Signing & Capabilities → + Capability → Push Notifications
6. Also add: Background Modes → Remote notifications

### 4. Android Notification Icon

Place your notification icon at:
```
android/app/src/main/res/drawable-mdpi/ic_notification.png    (24x24)
android/app/src/main/res/drawable-hdpi/ic_notification.png    (36x36)
android/app/src/main/res/drawable-xhdpi/ic_notification.png   (48x48)
android/app/src/main/res/drawable-xxhdpi/ic_notification.png  (72x72)
android/app/src/main/res/drawable-xxxhdpi/ic_notification.png (96x96)
```

### 5. Custom Sounds (Optional)

- **Android:** Place `.mp3`/`.wav` in `android/app/src/main/res/raw/`
- **iOS:** Add `.caf`/`.aiff` to the Xcode project bundle

### 6. Run

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Notification Channel Reference

| Channel | ID | Importance | Sound | Vibration |
|---------|------|-----------|-------|-----------|
| Orders | `orders` | HIGH | Yes | Yes |
| Chat | `chat` | HIGH | Yes | Yes |
| Promotions | `promotions` | DEFAULT | Yes | No |
| General | `default` | DEFAULT | Yes | No |

## Deep Link Scheme

### URL Scheme

```
pushnotifapp://notifications
pushnotifapp://notifications/preferences
pushnotifapp://orders/:orderId
```

### Notification Data Format

Include in your FCM payload's `data` field:

```json
{
  "screen": "OrderDetail",
  "params": {
    "orderId": "ORD-12345"
  },
  "category": "orders",
  "imageUrl": "https://example.com/image.png",
  "groupId": "order-updates",
  "groupSummary": "false"
}
```

### Supported Screens

| Screen | Route | Params |
|--------|-------|--------|
| Home | `/` | — |
| Notification Center | `/notifications` | — |
| Preferences | `/notifications/preferences` | — |
| Order Detail | `/orders/:orderId` | `orderId: string` |

## FCM Test Payload

Send via Firebase Console or REST API:

```json
{
  "message": {
    "token": "<FCM_TOKEN>",
    "notification": {
      "title": "Order Shipped!",
      "body": "Your order ORD-12345 is on its way."
    },
    "data": {
      "screen": "OrderDetail",
      "params": "{\"orderId\": \"ORD-12345\"}",
      "category": "orders"
    },
    "android": {
      "notification": {
        "channel_id": "orders"
      }
    },
    "apns": {
      "payload": {
        "aps": {
          "category": "orders",
          "sound": "default"
        }
      }
    }
  }
}
```

## Backend Integration

The app sends device tokens to your backend:

```
POST /devices/register
Content-Type: application/json

{
  "token": "<fcm_token>",
  "platform": "ios" | "android"
}
```

Update the URL in `src/services/NotificationService.ts` → `sendTokenToBackend()`.

## License

MIT
