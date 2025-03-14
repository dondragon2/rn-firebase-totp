import ExpoModulesCore
import FirebaseAuth
import FirebaseCore

public class FirebaseTOTPModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('FirebaseTOTP')` in JavaScript.
    Name("FirebaseTOTP")

    // Defines event names that the module can send to JavaScript.
    Events("onEnrollmentComplete", "onVerificationComplete", "onError")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("enrollUserInTOTP") { (userId: String?, accountName: String?, issuer: String?) in
      do {
        let user = try self.getFirebaseUser(userId)
        
        // Start the TOTP enrollment process
        let multiFactorSession = try await user.multiFactor.session()
        
        // Create a TOTP enrollment
        let totpSecret = try await TOTPMultiFactorGenerator.generateSecret(with: multiFactorSession)
        
        // Get the shared secret
        let sharedSecretKey = totpSecret.sharedSecretKey
        
        // Use provided parameters or defaults
        let finalAccountName = accountName ?? user.email ?? "default_account"
        let finalIssuer = issuer ?? "FirebaseTOTP"
        
        // Generate QR code URL
        let qrCodeURL = totpSecret.generateQRCodeURL(
            withAccountName: finalAccountName,
            issuer: finalIssuer
        )
        
        // Store the TOTP secret for later verification
        // In a real app, you might want to store this in a more secure way
        self.totpSecretForVerification = totpSecret
        
        // Return the enrollment information
        return [
          "secretKey": sharedSecretKey,
          "qrCodeUrl": qrCodeURL
        ]
      } catch {
        self.sendEvent("onError", [
          "error": error.localizedDescription
        ])
        throw error
      }
    }
    
    AsyncFunction("verifyTOTPCode") { (code: String, userId: String?) in
      do {
        let user = try self.getFirebaseUser(userId)
        
        // Make sure we have a TOTP secret to verify against
        guard let totpSecret = self.totpSecretForVerification else {
          throw NSError(domain: "FirebaseTOTP", code: 4, userInfo: [NSLocalizedDescriptionKey: "No TOTP secret available for verification. Please enroll first."])
        }
        
        // Create the assertion for enrollment
        let multiFactorAssertion = TOTPMultiFactorGenerator.assertionForEnrollment(
          with: totpSecret,
          oneTimePassword: code
        )
        
        // Enroll the user with the credential
        try await user.multiFactor.enroll(
          with: multiFactorAssertion,
          displayName: "TOTP"
        )
        
        // Clear the stored secret after successful verification
        self.totpSecretForVerification = nil
        
        // Return success
        return [
          "success": true,
          "message": "TOTP verification successful"
        ]
      } catch {
        self.sendEvent("onError", [
          "error": error.localizedDescription
        ])
        
        return [
          "success": false,
          "message": error.localizedDescription
        ]
      }
    }
    
    AsyncFunction("disableTOTP") { (userId: String?) in
      do {
        let user = try self.getFirebaseUser(userId)
        
        // Get the enrolled factors
        let enrolledFactors = user.multiFactor.enrolledFactors
        
        // Find the TOTP factor
        if let totpFactor = enrolledFactors.first(where: { $0.factorID == TOTPMultiFactorGenerator.factorID }) {
          // Unenroll the TOTP factor
          try await user.multiFactor.unenroll(with: totpFactor)
        }
      } catch {
        self.sendEvent("onError", [
          "error": error.localizedDescription
        ])
        throw error
      }
    }
  }
  
  // Store the TOTP secret between enrollment and verification
  private var totpSecretForVerification: TOTPSecret?
  
  // Helper method to get the Firebase user
  private func getFirebaseUser(_ userId: String?) throws -> User {
    let auth = Auth.auth()
    
    if let userId = userId, !userId.isEmpty {
      // In iOS, we can't directly get a user by ID from the client SDK
      // We should use the current user and verify the ID matches
      guard let currentUser = auth.currentUser, currentUser.uid == userId else {
        throw NSError(domain: "FirebaseTOTP", code: 2, userInfo: [NSLocalizedDescriptionKey: "User not found or ID doesn't match current user"])
      }
      return currentUser
    } else {
      // Get the current user
      guard let user = auth.currentUser else {
        throw NSError(domain: "FirebaseTOTP", code: 3, userInfo: [NSLocalizedDescriptionKey: "No user is currently signed in"])
      }
      return user
    }
  }
}
