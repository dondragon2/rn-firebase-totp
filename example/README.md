# Firebase TOTP Example

This example app demonstrates how to use the `rn-firebase-totp` module to implement Time-based One-Time Password (TOTP) authentication with Firebase.

## Setup

1. Install dependencies:
   ```bash
   cd example
   bun install
   ```

2. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add an iOS app with bundle ID `com.uluru.fb.totp.example`
   - Add an Android app with package name `com.uluru.fb.totp.example`
   - Download the configuration files:
     - `GoogleService-Info.plist` for iOS
     - `google-services.json` for Android
   - Place these files in the root of the example directory

3. Enable Anonymous Authentication in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Anonymous Authentication

4. Run the app:
   ```bash
   # For iOS
   bun run ios
   
   # For Android
   bun run android
   ```

## Usage

1. Sign in anonymously
2. Enroll in TOTP
3. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
4. Enter the 6-digit code from your authenticator app
5. Verify the code
6. Optionally, disable TOTP

## Notes

- This example uses anonymous authentication for simplicity. In a real app, you would use email/password, phone, or other authentication methods.
- The Android implementation is a placeholder since Firebase Android SDK doesn't directly support TOTP yet.
- The iOS implementation uses Firebase Auth's native TOTP support.

## Troubleshooting

- If you encounter issues with Firebase initialization, make sure your configuration files are correctly placed and formatted.
- For iOS, you may need to run `pod install` in the `ios` directory.
- For Android, make sure the Google Services plugin is correctly configured. 