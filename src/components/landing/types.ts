/**
 * Shared types for Landing page components
 */

export interface RegistrationFormData {
  name: string;
  phone: string;
  email: string;
  family_size: string;
  children_ages: string;
  comments: string;
}

export const INITIAL_FORM_DATA: RegistrationFormData = {
  name: "",
  phone: "",
  email: "",
  family_size: "",
  children_ages: "",
  comments: "",
};

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location_name: string;
  location_address: string;
  [key: string]: unknown;
}
