/**
 * SciHub Pro - Toast Notification Utilities
 * 
 * Provides convenient wrapper functions for toast notifications
 * with consistent styling for success, error, info, warning states.
 * 
 * Usage:
 *   import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
 *   
 *   showSuccessToast('Connected!', 'PubMed API connection established');
 *   showErrorToast('Connection Failed', 'Unable to reach the server');
 */

import { toast } from '@/hooks/use-toast';

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

/**
 * Show a success toast (green themed with checkmark icon)
 * Use for: successful operations, connections, saves, completions
 */
export const showSuccessToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'success',
  });
};

/**
 * Show an error toast (red themed with X icon)
 * Use for: failed operations, connection errors, validation failures
 */
export const showErrorToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'error',
  });
};

/**
 * Show a warning toast (yellow themed with alert icon)
 * Use for: warnings, cautions, rate limits, storage alerts
 */
export const showWarningToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'warning',
  });
};

/**
 * Show an info toast (blue themed with info icon)
 * Use for: informational messages, tips, guidance
 */
export const showInfoToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'info',
  });
};

/**
 * Show a loading/pending toast
 * Returns the toast ID so it can be dismissed later
 */
export const showLoadingToast = (title: string, description?: string): string => {
  const id = Date.now().toString();
  toast({
    title,
    description,
    variant: 'warning',
    duration: Infinity, // Don't auto-dismiss loading toasts
  });
  return id;
};

/**
 * Dismiss a specific toast by ID
 * Note: This requires the underlying toast library to support dismiss
 */
// export const dismissToast = (id: string) => {
//   toast.dismiss(id);
// };

/**
 * Dismiss all toasts
 */
// export const dismissAllToasts = () => {
//   toast.dismiss();
// };
