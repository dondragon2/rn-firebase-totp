
export type TOTPEnrollmentResult = {
  secretKey: string;
  qrCodeUrl: string;
  verificationId: string;
};

export type TOTPVerificationResult = {
  success: boolean;
  message?: string;
};

export type FirebaseTOTPModuleEvents = {
  onEnrollmentComplete: (params: TOTPEnrollmentResult) => void;
  onVerificationComplete: (params: TOTPVerificationResult) => void;
  onError: (params: { error: string }) => void;
};
