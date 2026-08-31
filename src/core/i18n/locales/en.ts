const en = {
  appName: 'Notebook',
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    create: 'Create',
    back: 'Back',
    open: 'Open'
  },
  states: {
    loading: 'Loading…'
  },
  form: {
    required: 'This field is required.',
    error: 'Could not save. Please try again.'
  },
  layout: {
    menu: 'Menu',
    language: 'Language'
  },
  auth: {
    signInTitle: 'Sign in to Notebook',
    forgotPasswordTitle: 'Reset your password',
    forgotPasswordDescription: "Enter your email and we'll send you a password reset link.",
    resetPasswordSent: 'If an account exists for this email, you will receive a password reset link.',
    resetPasswordTitle: 'Choose a new password',
    resetPasswordDescription: 'Enter a new password for {{email}}.',
    resetPasswordSuccess: 'Your password has been updated. You can now sign in.',
    email: 'Email',
    password: 'Password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    signInAction: 'Sign in',
    forgotPassword: 'Forgot password?',
    sendResetLink: 'Send reset link',
    resendResetLinkIn: 'Send again in {{seconds}}s',
    updatePassword: 'Update password',
    backToSignIn: 'Back to sign in',
    signOut: 'Sign out',
    errors: {
      invalidCredentials: 'Incorrect email or password.',
      userNotFound: 'No account found with this email.',
      weakPassword: 'Password must be at least 6 characters.',
      tooManyRequests: 'Too many attempts. Please try again later.',
      passwordMismatch: 'Passwords do not match.',
      resetLinkInvalid: 'This password reset link is invalid or has expired.',
      generic: 'Something went wrong. Please try again.'
    }
  },
  offline: {
    online: 'Online',
    offline: "Offline — changes will sync once you're back online",
    syncing: 'Syncing…'
  },
  theme: {
    toggle: 'Toggle dark / light mode'
  },
  notFound: {
    title: 'Page not found',
    backHome: 'Back to home'
  }
}

export type Dictionary = typeof en

export default en
