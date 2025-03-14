import { NativeModule, requireNativeModule } from 'expo';

import { FirebaseTOTPModuleEvents } from './FirebaseTOTP.types';

declare class FirebaseTOTPModule extends NativeModule<FirebaseTOTPModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<FirebaseTOTPModule>('FirebaseTOTP');
