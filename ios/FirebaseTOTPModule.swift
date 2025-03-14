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
    AsyncFunction("enrollUserInTOTP") { (userId: String?) in
      do {
        let user = try self.getFirebaseUser(userId)
        
        // Start the TOTP enrollment process
        let multiFactorSession = try await user.multiFactor.getSession()
        
        // Create a TOTP enrollment
        let totpEnrollment = try await TOTPMultiFactorGenerator.generateSecret(with: multiFactorSession)
        
        // Get the shared secret and QR code URL
        let sharedSecretKey = totpEnrollment.sharedSecretKey
        let qrCodeURL = totpEnrollment.generateQRCodeURL()
        
        // Return the enrollment information
        return [
          "secretKey": sharedSecretKey,
          "qrCodeUrl": qrCodeURL.absoluteString,
          "verificationId": totpEnrollment.verificationId
        ]
      } catch {
        self.sendEvent("onError", [
          "error": error.localizedDescription
        ])
        throw error
      }
    }
    
    AsyncFunction("verifyTOTPCode") { (code: String, verificationId: String, userId: String?) in
      do {
        let user = try self.getFirebaseUser(userId)
        
        // Create the credential
        let credential = TOTPMultiFactorGenerator.credential(
          withVerificationID: verificationId,
          oneTimePassword: code
        )
        
        // Enroll the user with the credential
        try await user.multiFactor.enroll(with: credential, displayName: "TOTP")
        
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
  
  // Helper method to get the Firebase user
  private func getFirebaseUser(_ userId: String?) throws -> User {
    guard let auth = Auth.auth() else {
      throw NSError(domain: "FirebaseTOTP", code: 1, userInfo: [NSLocalizedDescriptionKey: "Firebase Auth not initialized"])
    }
    
    if let userId = userId, !userId.isEmpty {
      // Get the user by ID
      guard let user = try? await auth.getUser(userId) else {
        throw NSError(domain: "FirebaseTOTP", code: 2, userInfo: [NSLocalizedDescriptionKey: "User not found"])
      }
      return user
    } else {
      // Get the current user
      guard let user = auth.currentUser else {
        throw NSError(domain: "FirebaseTOTP", code: 3, userInfo: [NSLocalizedDescriptionKey: "No user is currently signed in"])
      }
      return user
    }
  }
}
