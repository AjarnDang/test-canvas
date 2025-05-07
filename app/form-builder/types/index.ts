/**
 * Form Builder Types
 * 
 * This file contains type definitions used throughout the form builder.
 */

/**
 * Base form item interface
 */
export interface FormItem {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  pageNumber?: number; // Optional page number (for multi-page PDFs)
  value?: string | string[] | boolean | number; // Value for form fields
  checkboxOptions?: string[]; // For storing checkbox options
  options?: {
    [key: string]: string | number | boolean | string[] | Record<string, unknown>;
  }; // Additional options specific to the form element type
}

/**
 * Form element types
 */
export type FormElementType = 
  | 'text'
  | 'name'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio';

/**
 * PDF metadata
 */
export interface PdfMetadata {
  key: string;
  title: string;
  filename: string;
  description?: string;
  pageCount?: number;
  createdAt?: string;
}

/**
 * Form data including items and metadata
 */
export interface FormData extends PdfMetadata {
  items: FormItem[];
} 