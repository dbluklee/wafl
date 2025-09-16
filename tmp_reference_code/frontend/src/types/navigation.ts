// Navigation types for the application
export type PageType = 'welcome' | 'signup' | 'signin' | 'homepage' | 'management';

export interface NavigationState {
  currentPage: PageType;
  history: PageType[];
}

export interface NavigationActions {
  navigateTo: (page: PageType) => void;
  goBack: () => void;
  goToWelcome: () => void;
  goToSignUp: () => void;
  goToSignIn: () => void;
  goToHomepage: () => void;
}