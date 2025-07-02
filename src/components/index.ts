/**
 * Components - centralized exports
 * 
 * This module provides a centralized export point for major component groups.
 */

// Layout components
export { Navigation } from './Navigation';
export { Footer } from './layout/Footer';

// Auth components
export { AuthForm } from './auth/AuthForm';
export { AuthHeader } from './auth/AuthHeader';
export { LoginForm } from './auth/LoginForm';
export { SignUpForm } from './auth/SignUpForm';
export { GoogleAuthButton } from './auth/GoogleAuthButton';
export { ForgotPasswordForm } from './auth/ForgotPasswordForm';

// Dashboard components
export { Dashboard } from './dashboard/Dashboard';
export { WelcomeScreen } from './dashboard/WelcomeScreen';
export { QuickActions } from './dashboard/QuickActions';
export { UpcomingEvents } from './dashboard/UpcomingEvents';
export { StatusBanner } from './dashboard/StatusBanner';

// Events components
export { EventsList } from './events/EventsList';
export { EventCard } from './events/EventCard';
export { CreateEventForm } from './events/CreateEventForm';
export { EventTimeline } from './events/EventTimeline';

// Reports components
export { ReportsList } from './reports/ReportsList';
export { ReportsTabs } from './reports/ReportsTabs';
export { ReportDetail } from './reports/ReportDetail';

// Users components
export { UsersTable } from './users/UsersTable';
export { UserProfileTabs } from './profile/UserProfileTabs';

// Onboarding components
export { OnboardingTour } from './onboarding/OnboardingTour';
export { HelpButton } from './onboarding/HelpButton';