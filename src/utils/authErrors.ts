/**
 * Reusable utility to convert Firebase Authentication error codes
 * into clear, user-friendly, non-technical error messages.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred. Please try again.';

  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('auth/invalid-credential')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (message.includes('auth/user-not-found')) {
    return 'No account found with this email address. Please check your spelling or register.';
  }
  if (message.includes('auth/wrong-password')) {
    return 'Incorrect password. Please try again or use the forgot password link.';
  }
  if (message.includes('auth/invalid-email')) {
    return 'Please enter a valid email address format (e.g. name@example.de).';
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'An account with this email address already exists. Please log in instead.';
  }
  if (message.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
  }
  if (message.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact Tschüss platform support.';
  }
  if (message.includes('auth/too-many-requests')) {
    return 'Firebase has temporarily limited verification emails. Please wait before trying again; repeated clicks extend the lockout.';
  }
  if (message.includes('auth/network-request-failed')) {
    return 'Unable to connect to the authentication server. Please check your internet connection.';
  }
  if (message.includes('auth/operation-not-allowed')) {
    return 'Email/Password sign-in is currently disabled in the Firebase Console. Please enable the Email/Password provider.';
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return 'Authentication process was cancelled.';
  }
  if (message.includes('auth/requires-recent-login')) {
    return 'For security, please log out and log in again before completing this action.';
  }
  if (message.includes('auth/unverified-email')) {
    return 'Your email address has not been verified yet. Please check your inbox for the verification link.';
  }

  // Fallback friendly message for any other unexpected error
  return 'Authentication failed. Please check your details and try again.';
}
