import * as React from 'react';

import { FirebaseTOTPViewProps } from './FirebaseTOTP.types';

export default function FirebaseTOTPView(props: FirebaseTOTPViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
