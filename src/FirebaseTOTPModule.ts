import { NativeModule, requireNativeModule } from 'expo';

import { FirebaseTOTPModuleEvents, TOTPEnrollmentResult, TOTPVerificationResult } from './FirebaseTOTP.types';

declare class FirebaseTOTPModule extends NativeModule<FirebaseTOTPModuleEvents> {
  /**
   * Enrolls a user in TOTP (Time-based One-Time Password) authentication.
   * @param userId The Firebase user ID to enroll. If not provided, uses the currently authenticated user.
   * @param accountName Optional account name to use in the QR code URL. If not provided, uses the user's email.
   * @param issuer Optional issuer name to use in the QR code URL. If not provided, uses "FirebaseTOTP".
   * @returns A promise that resolves with the enrollment result.
   */
  enrollUserInTOTP(userId?: string, accountName?: string, issuer?: string): Promise<TOTPEnrollmentResult>;

  /**
   * Verifies a TOTP code for a user.
   * @param code The TOTP code to verify.
   * @param verificationId The verification ID received during enrollment.
   * @param userId The Firebase user ID to verify. If not provided, uses the currently authenticated user.
   * @returns A promise that resolves with the verification result.
   */
  verifyTOTPCode(code: string, verificationId: string, userId?: string): Promise<TOTPVerificationResult>;

  /**
   * Disables TOTP for a user.
   * @param userId The Firebase user ID to disable TOTP for. If not provided, uses the currently authenticated user.
   * @returns A promise that resolves when TOTP is disabled.
   */
  disableTOTP(userId?: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<FirebaseTOTPModule>('FirebaseTOTP');
