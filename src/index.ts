// Native module for Firebase TOTP authentication
import FirebaseTOTPModule from './FirebaseTOTPModule';
import { TOTPEnrollmentResult, TOTPVerificationResult, FirebaseTOTPModuleEvents } from './FirebaseTOTP.types';

export { FirebaseTOTPModule };
export type { 
  TOTPEnrollmentResult, 
  TOTPVerificationResult, 
  FirebaseTOTPModuleEvents 
};

// Re-export the module type for better TypeScript support
export type FirebaseTOTPModuleType = typeof FirebaseTOTPModule;
