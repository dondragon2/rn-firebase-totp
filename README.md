# rn-firebase-totp

A React Native module that provides Time-based One-Time Password (TOTP) authentication integration with Firebase for Android and iOS platforms.

## Installation

### From npm (coming soon)

```bash
npm install rn-firebase-totp
# or
yarn add rn-firebase-totp
# or
bun add rn-firebase-totp
```

### From GitHub Packages

First, authenticate with GitHub Packages by creating a `.npmrc` file in your project root:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@dondragon2:registry=https://npm.pkg.github.com
```

Replace `YOUR_GITHUB_TOKEN` with a GitHub personal access token that has the `read:packages` scope.

Then install the package:

```bash
npm install @dondragon2/rn-firebase-totp
# or
yarn add @dondragon2/rn-firebase-totp
# or
bun add @dondragon2/rn-firebase-totp
```

### Prerequisites

This module requires the following Firebase modules to be installed (version 21.12.0 or compatible):

```bash
npm install @react-native-firebase/app@21.12.0 @react-native-firebase/auth@21.12.0
# or
yarn add @react-native-firebase/app@21.12.0 @react-native-firebase/auth@21.12.0
# or
bun add @react-native-firebase/app@21.12.0 @react-native-firebase/auth@21.12.0
```

## Usage

```javascript
import { FirebaseTOTPModule } from '@dondragon2/rn-firebase-totp';

// Enroll a user in TOTP
const enrollUser = async (userId = null, accountName = null, issuer = null) => {
  try {
    const result = await FirebaseTOTPModule.enrollUserInTOTP(userId, accountName, issuer);
    console.log('TOTP Enrollment Result:', result);
    
    // result contains:
    // - secretKey: The secret key to be used in authenticator apps
    // - qrCodeUrl: URL for QR code that can be scanned by authenticator apps
    
    return result;
  } catch (error) {
    console.error('TOTP Enrollment Error:', error);
    throw error;
  }
};

// Verify a TOTP code
const verifyTOTPCode = async (code, userId = null) => {
  try {
    const result = await FirebaseTOTPModule.verifyTOTPCode(code, userId);
    console.log('TOTP Verification Result:', result);
    
    // result contains:
    // - success: Boolean indicating if verification was successful
    // - message: Additional information about the verification
    
    return result;
  } catch (error) {
    console.error('TOTP Verification Error:', error);
    throw error;
  }
};

// Disable TOTP for a user
const disableTOTP = async (userId = null) => {
  try {
    await FirebaseTOTPModule.disableTOTP(userId);
    console.log('TOTP disabled successfully');
  } catch (error) {
    console.error('TOTP Disable Error:', error);
    throw error;
  }
};
```

## Important Note on Verification

**For iOS**: The TOTP verification process requires that you call `verifyTOTPCode` immediately after `enrollUserInTOTP` in the same session. This is because the TOTP secret is stored in memory between these calls. If your app is restarted or the module is reloaded, you will need to re-enroll the user.

**For Android**: The implementation is a placeholder since Firebase Android SDK doesn't directly support TOTP yet.

## API Reference

### `enrollUserInTOTP(userId?: string, accountName?: string, issuer?: string): Promise<TOTPEnrollmentResult>`

Enrolls a user in TOTP authentication.

- **Parameters:**
  - `userId` (optional): The Firebase user ID to enroll. If not provided, uses the currently authenticated user.
  - `accountName` (optional): The account name to use in the QR code URL. If not provided, uses the user's email.
  - `issuer` (optional): The issuer name to use in the QR code URL. If not provided, uses "FirebaseTOTP".
  
- **Returns:** A promise that resolves with the enrollment result:
  ```typescript
  {
    secretKey: string;    // The secret key to be used in authenticator apps
    qrCodeUrl: string;    // URL for QR code that can be scanned by authenticator apps
  }
  ```

### `verifyTOTPCode(code: string, userId?: string): Promise<TOTPVerificationResult>`

Verifies a TOTP code for a user.

- **Parameters:**
  - `code`: The TOTP code to verify.
  - `userId` (optional): The Firebase user ID to verify. If not provided, uses the currently authenticated user.
  
- **Returns:** A promise that resolves with the verification result:
  ```typescript
  {
    success: boolean;     // Whether the verification was successful
    message?: string;     // Additional information about the verification
  }
  ```

### `disableTOTP(userId?: string): Promise<void>`

Disables TOTP for a user.

- **Parameters:**
  - `userId` (optional): The Firebase user ID to disable TOTP for. If not provided, uses the currently authenticated user.
  
- **Returns:** A promise that resolves when TOTP is disabled.

## Example App

Check out the [example](./example) directory for a complete example app that demonstrates how to use this module. The example app shows:

1. How to set up Firebase authentication
2. How to enroll a user in TOTP
3. How to verify a TOTP code
4. How to disable TOTP

To run the example app:

```bash
cd example
bun install
# Configure Firebase (see example/README.md)
bun run ios     # For iOS
bun run android # For Android
```

## Platform Support

This module only supports:
- iOS: Fully supported using Firebase Auth's native TOTP implementation.
- Android: Limited support as Firebase Android SDK doesn't directly support TOTP yet. This module provides a placeholder implementation.

## License

MIT 