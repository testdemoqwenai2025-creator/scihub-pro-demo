/**
 * SciHub Pro - Toast Notification Utilities
 * 
 * Provides convenient wrapper functions for toast notifications
 * with consistent styling for success, error, info, and loading states.
 */

import { toast } from '@/hooks/use-toast';

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

/**
 * Show a success toast (green themed)
 */
export const showSuccessToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'default',
    className: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
  });
};

/**
 * Show an error toast (red/destructive themed)
 */
export const showErrorToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    variant: 'destructive',
  });
};

/**
 * Show an info toast (blue themed)
 */
export const showInfoToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
  });
};

/**
 * Show a warning toast (yellow/orange themed)
 */
export const showWarningToast = (title: string, description?: string) => {
  return toast({
    title,
    description,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
  });
};

/**
 * Show a loading toast (yellow themed)
 * Returns the toast ID so it can be dismissed later
 */
export const showLoadingToast = (title: string, description?: string): string => {
  const id = Date.now().toString();
  toast({
    id,
    title,
    description,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
    duration: Infinity, // Don't auto-dismiss loading toasts
  });
  return id;
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (id: string) => {
  toast.dismiss(id);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
