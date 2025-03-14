import { requireNativeView } from 'expo';
import * as React from 'react';

import { FirebaseTOTPViewProps } from './FirebaseTOTP.types';

const NativeView: React.ComponentType<FirebaseTOTPViewProps> =
  requireNativeView('FirebaseTOTP');

export default function FirebaseTOTPView(props: FirebaseTOTPViewProps) {
  return <NativeView {...props} />;
}
