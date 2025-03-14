import React, { useState, useEffect } from 'react';
import { useEvent } from 'expo';
import { FirebaseTOTPModule, TOTPEnrollmentResult, TOTPVerificationResult } from 'rn-firebase-totp';
import { Button, SafeAreaView, ScrollView, Text, View, TextInput, StyleSheet, Alert, Linking } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [enrollmentResult, setEnrollmentResult] = useState<TOTPEnrollmentResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<TOTPVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Handle user sign in
  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For demo purposes, we're using anonymous sign-in
      // In a real app, you would use email/password, phone, or other auth methods
      await auth().signInAnonymously();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle user sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await auth().signOut();
      setEnrollmentResult(null);
      setVerificationResult(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enroll user in TOTP
  const enrollInTOTP = async () => {
    if (!user) {
      setError('You must be signed in to enroll in TOTP');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await FirebaseTOTPModule.enrollUserInTOTP();
      setEnrollmentResult(result);
      Alert.alert(
        'TOTP Enrollment',
        'Scan the QR code with your authenticator app, then enter the code to verify.',
        [
          {
            text: 'Open QR Code',
            onPress: () => Linking.openURL(result.qrCodeUrl),
          },
          { text: 'OK' },
        ]
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify TOTP code
  const verifyTOTP = async () => {
    if (!user || !enrollmentResult) {
      setError('You must be signed in and enrolled in TOTP to verify a code');
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await FirebaseTOTPModule.verifyTOTPCode(
        verificationCode,
        enrollmentResult.verificationId
      );
      setVerificationResult(result);
      
      if (result.success) {
        Alert.alert('Success', 'TOTP verification successful! Your account is now protected with 2FA.');
      } else {
        Alert.alert('Failed', result.message || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disable TOTP
  const disableTOTP = async () => {
    if (!user) {
      setError('You must be signed in to disable TOTP');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await FirebaseTOTPModule.disableTOTP();
      setEnrollmentResult(null);
      setVerificationResult(null);
      Alert.alert('Success', 'TOTP has been disabled for your account.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>Firebase TOTP Example</Text>
        
        {/* Authentication Section */}
        <Group name="Authentication">
          {user ? (
            <>
              <Text style={styles.text}>Signed in as: {user.uid}</Text>
              <Button title="Sign Out" onPress={signOut} disabled={loading} />
            </>
          ) : (
            <>
              <Text style={styles.text}>Not signed in</Text>
              <Button title="Sign In Anonymously" onPress={signIn} disabled={loading} />
            </>
          )}
        </Group>

        {/* TOTP Enrollment Section */}
        {user && (
          <Group name="TOTP Enrollment">
            {enrollmentResult ? (
              <>
                <Text style={styles.text}>Enrolled in TOTP</Text>
                <Text style={styles.text}>Secret Key: {enrollmentResult.secretKey}</Text>
                <Button 
                  title="Open QR Code" 
                  onPress={() => Linking.openURL(enrollmentResult.qrCodeUrl)} 
                  disabled={loading} 
                />
              </>
            ) : (
              <>
                <Text style={styles.text}>Not enrolled in TOTP</Text>
                <Button title="Enroll in TOTP" onPress={enrollInTOTP} disabled={loading} />
              </>
            )}
          </Group>
        )}

        {/* TOTP Verification Section */}
        {user && enrollmentResult && (
          <Group name="TOTP Verification">
            <Text style={styles.text}>Enter the 6-digit code from your authenticator app:</Text>
            <TextInput
              style={styles.input}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
            />
            <Button title="Verify Code" onPress={verifyTOTP} disabled={loading || verificationCode.length !== 6} />
            
            {verificationResult && (
              <Text style={[styles.text, verificationResult.success ? styles.success : styles.error]}>
                {verificationResult.message || (verificationResult.success ? 'Verification successful!' : 'Verification failed.')}
              </Text>
            )}
          </Group>
        )}

        {/* Disable TOTP Section */}
        {user && verificationResult?.success && (
          <Group name="Disable TOTP">
            <Button title="Disable TOTP" onPress={disableTOTP} disabled={loading} />
          </Group>
        )}

        {/* Error Display */}
        {error && (
          <Group name="Error">
            <Text style={[styles.text, styles.error]}>{error}</Text>
          </Group>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  group: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
});
