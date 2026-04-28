export type Locale = 'en' | 'cs'

export interface Translations {
  common: {
    loading: string
    save: string
    cancel: string
    back: string
    signOut: string
    you: string
    unknown: string
  }

  auth: {
    signIn: string
    signUp: string
    createAccount: string
    signingIn: string
    creatingAccount: string
    email: string
    password: string
    confirmPassword: string
    emailPlaceholder: string
    passwordPlaceholder: string
    passwordHint: string
    dontHaveAccount: string
    alreadyHaveAccount: string
    passwordsDoNotMatch: string
    passwordTooShort: string
  }

  onboarding: {
    welcome: string
    letsSetup: string
    getStarted: string
    createOrJoin: string
    createNewHousehold: string
    joinWithCode: string
    createHousehold: string
    joinHousehold: string
    creating: string
    joining: string
    householdName: string
    householdNamePlaceholder: string
    yourName: string
    yourNamePlaceholder: string
    partnerNamePlaceholder: string
    monthlyIncome: string
    incomePlaceholder: string
    partnerIncomePlaceholder: string
    currency: string
    inviteCode: string
    inviteCodePlaceholder: string
    inviteCodeHint: string
    invalidInviteCode: string
    notAuthenticated: string
  }

  app: {
    title: string
    subtitle: string
    householdMembers: string
    inviteCodeLabel: string
    shareCodeHint: string
    copyCode: string
    codeCopied: string
    expenses: string
    addExpense: string
    loadingExpenses: string
    noExpenses: string
  }

  summary: {
    totalHouseholdExpenses: string
    householdShare: string
    privateExpenses: string
    toHomeAccount: string
    totalToPay: string
  }

  expense: {
    addExpense: string
    addTemporary: string
    editExpense: string
    adding: string
    saving: string
    saveChanges: string
    amount: string
    description: string
    descriptionPlaceholder: string
    category: string
    type: string
    household: string
    private: string
    paidBy: string
    includeInHousehold: string
    paidByOwnerOnly: string
    paidByOwnerOnlyHint: string
    swipeHint: string
    noMatch: string
    filterAll: string
    filterHousehold: string
    filterYourPrivate: string
    allExpenses: string
    householdOnly: string
    yourPrivate: string
    failedToDelete: string
  }

  profile: {
    editProfile: string
    displayName: string
    displayNamePlaceholder: string
    displayNameHint: string
    monthlyIncome: string
    incomeHint: string
    remaining: string
  }

  theme: {
    system: string
    dark: string
    light: string
    currentTheme: string
  }

  categories: {
    groceries: string
    utilities: string
    rentMortgage: string
    transportation: string
    entertainment: string
    diningOut: string
    healthcare: string
    personalCare: string
    clothing: string
    subscriptions: string
    gifts: string
    other: string
  }

  currencies: {
    CZK: string
    EUR: string
    USD: string
    GBP: string
    PLN: string
  }

  roles: {
    owner: string
    member: string
  }

  preview: {
    enter: string
    label: string
    save: string
    saving: string
    discard: string
    noChangesYet: string
    pendingCount: string
    simulatedCount: string
    discardConfirmTitle: string
    discardConfirmMessage: string
    simulateIncomeTitle: string
    simulateIncomeHint: string
    applySimulation: string
    simulatedBadge: string
  }
}
