/**
 * Report forms - centralized exports
 * 
 * This module consolidates all report form related components for easier imports.
 */

// Main form components
export { ReportFormSimplified } from '../ReportFormSimplified';
export { CreateReportForm } from '../CreateReportForm';

// Form sections
export { ReportBasicInfo } from '../form-sections/ReportBasicInfo';
export { EventRatingSection } from '../form-sections/EventRatingSection';
export { FeedbackSection } from '../form-sections/FeedbackSection';
export { MediaUploadSection } from '../form-sections/MediaUploadSection';
export { ParticipantsSection } from '../form-sections/ParticipantsSection';
export { TzoharSection } from '../form-sections/TzoharSection';

// Form actions and headers
export { ReportFormActions } from '../form-components/ReportFormActions';
export { ReportFormContent } from '../form-components/ReportFormContent';
export { ReportFormHeader } from '../form-components/ReportFormHeader';

// Tzohar specific forms
export { TzoharReportForm } from '../tzohar/TzoharReportForm';
export { TzoharReportContent } from '../tzohar/TzoharReportContent';