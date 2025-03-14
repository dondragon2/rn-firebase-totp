import { registerWebModule, NativeModule } from 'expo';

import { FirebaseTOTPModuleEvents } from './FirebaseTOTP.types';

class FirebaseTOTPModule extends NativeModule<FirebaseTOTPModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(FirebaseTOTPModule);
