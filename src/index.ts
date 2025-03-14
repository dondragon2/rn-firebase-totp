// Reexport the native module. On web, it will be resolved to FirebaseTOTPModule.web.ts
// and on native platforms to FirebaseTOTPModule.ts
export { default } from './FirebaseTOTPModule';
export { default as FirebaseTOTPView } from './FirebaseTOTPView';
export * from  './FirebaseTOTP.types';
