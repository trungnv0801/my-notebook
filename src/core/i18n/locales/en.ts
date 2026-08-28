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
    signUpTitle: 'Create your account',
    email: 'Email',
    password: 'Password',
    displayName: 'Display name',
    signInAction: 'Sign in',
    signUpAction: 'Sign up',
    googleSignIn: 'Continue with Google',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    signOut: 'Sign out',
    errors: {
      invalidCredentials: 'Incorrect email or password.',
      userNotFound: 'No account found with this email.',
      emailInUse: 'This email is already registered.',
      weakPassword: 'Password must be at least 6 characters.',
      tooManyRequests: 'Too many attempts. Please try again later.',
      popupClosed: 'The Google sign-in window was closed.',
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
