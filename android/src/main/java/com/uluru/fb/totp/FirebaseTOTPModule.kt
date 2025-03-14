package com.uluru.fb.totp

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.MultiFactor
import com.google.firebase.auth.PhoneMultiFactorGenerator
import com.google.firebase.auth.PhoneMultiFactorInfo
import kotlinx.coroutines.tasks.await

class FirebaseTOTPModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('FirebaseTOTP')` in JavaScript.
    Name("FirebaseTOTP")

    // Defines event names that the module can send to JavaScript.
    Events("onEnrollmentComplete", "onVerificationComplete", "onError")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("enrollUserInTOTP") { userId: String?, accountName: String?, issuer: String? ->
      try {
        val user = getFirebaseUser(userId)
        
        // Note: Firebase Android SDK doesn't directly support TOTP yet
        // This is a placeholder implementation
        // In a real implementation, you would use a custom TOTP library
        
        // Generate a random secret key (base32 encoded)
        val secretKey = generateTOTPSecret()
        
        // Generate a verification ID (this would be used to link the TOTP with the user)
        val verificationId = java.util.UUID.randomUUID().toString()
        
        // Use provided parameters or defaults
        val finalAccountName = accountName ?: user.email ?: "user"
        val finalIssuer = issuer ?: "FirebaseTOTP"
        
        // Generate a QR code URL (using standard TOTP URI format)
        val qrCodeUrl = generateTOTPQRCodeUrl(finalAccountName, finalIssuer, secretKey)
        
        // Return the enrollment information
        mapOf(
          "secretKey" to secretKey,
          "qrCodeUrl" to qrCodeUrl,
          "verificationId" to verificationId
        )
      } catch (e: Exception) {
        sendEvent("onError", mapOf("error" to e.localizedMessage))
        throw e
      }
    }
    
    AsyncFunction("verifyTOTPCode") { code: String, verificationId: String, userId: String? ->
      try {
        // Note: Firebase Android SDK doesn't directly support TOTP yet
        // This is a placeholder implementation
        // In a real implementation, you would verify the TOTP code against the secret
        
        // For demonstration, we'll just check if the code is 6 digits
        val isValid = code.length == 6 && code.all { it.isDigit() }
        
        if (isValid) {
          mapOf(
            "success" to true,
            "message" to "TOTP verification successful"
          )
        } else {
          mapOf(
            "success" to false,
            "message" to "Invalid TOTP code"
          )
        }
      } catch (e: Exception) {
        sendEvent("onError", mapOf("error" to e.localizedMessage))
        mapOf(
          "success" to false,
          "message" to e.localizedMessage
        )
      }
    }
    
    AsyncFunction("disableTOTP") { userId: String? ->
      try {
        // Note: Firebase Android SDK doesn't directly support TOTP yet
        // This is a placeholder implementation
        // In a real implementation, you would remove the TOTP from the user's account
        
        // For demonstration, we'll just return success
        Unit
      } catch (e: Exception) {
        sendEvent("onError", mapOf("error" to e.localizedMessage))
        throw e
      }
    }
  }
  
  // Helper method to get the Firebase user
  private fun getFirebaseUser(userId: String?): FirebaseUser {
    val auth = FirebaseAuth.getInstance()
    
    if (!userId.isNullOrEmpty()) {
      // Note: Firebase Android SDK doesn't have a direct way to get a user by ID
      // In a real implementation, you would need to use Firebase Admin SDK or a custom backend
      throw Exception("Getting user by ID is not supported in the Android client SDK")
    } else {
      // Get the current user
      return auth.currentUser ?: throw Exception("No user is currently signed in")
    }
  }
  
  // Helper method to generate a random TOTP secret
  private fun generateTOTPSecret(): String {
    val chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567" // Base32 character set
    val random = java.security.SecureRandom()
    val secretLength = 16 // 16 characters = 80 bits
    
    return (1..secretLength)
      .map { chars[random.nextInt(chars.length)] }
      .joinToString("")
  }
  
  // Helper method to generate a TOTP QR code URL
  private fun generateTOTPQRCodeUrl(username: String, issuer: String, secret: String): String {
    val encodedIssuer = java.net.URLEncoder.encode(issuer, "UTF-8")
    val encodedUsername = java.net.URLEncoder.encode(username, "UTF-8")
    
    return "otpauth://totp/$encodedIssuer:$encodedUsername?secret=$secret&issuer=$encodedIssuer&algorithm=SHA1&digits=6&period=30"
  }
}
