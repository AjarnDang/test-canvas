/**
 * PDF Form Manager Utility
 * 
 * This utility provides functions to manage form elements across multiple PDF pages.
 * It allows for saving, restoring, updating, and deleting form objects per page.
 */

import { FormItem } from '../types';

// Type definition for page-based form items storage
export interface PageFormItems {
  [pageNumber: number]: FormItem[];
}

/**
 * Save form objects for the current page
 * 
 * @param formItems - Array of form items to save
 * @param pageNumber - Current page number
 * @param existingItems - Existing page-based form items (optional)
 * @returns Updated page-based form items
 */
export function saveCurrentPageObjects(
  formItems: FormItem[],
  pageNumber: number,
  existingItems: PageFormItems = {}
): PageFormItems {
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...existingItems };
  
  // Save the items for the current page
  updatedItems[pageNumber] = [...formItems];
  
  return updatedItems;
}

/**
 * Restore form objects for a specific page
 * 
 * @param pageNumber - Page number to restore items for
 * @param pageFormItems - Page-based form items storage
 * @returns Array of form items for the specified page
 */
export function restorePageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): FormItem[] {
  // If no items exist for this page, return an empty array
  if (!pageFormItems[pageNumber]) {
    return [];
  }
  
  // Return a copy of the items for the specified page
  return [...pageFormItems[pageNumber]];
}

/**
 * Update form objects for a specific page
 * 
 * @param pageNumber - Page number to update
 * @param formItems - New form items for the page
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items
 */
export function updatePageObjects(
  pageNumber: number,
  formItems: FormItem[],
  pageFormItems: PageFormItems
): PageFormItems {
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Update the items for the specified page
  updatedItems[pageNumber] = [...formItems];
  
  return updatedItems;
}

/**
 * Delete all form objects for a specific page
 * 
 * @param pageNumber - Page number to delete items from
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items
 */
export function deletePageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): PageFormItems {
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Delete items for the specified page
  delete updatedItems[pageNumber];
  
  return updatedItems;
}

/**
 * Delete a specific form object from a page
 * 
 * @param pageNumber - Page number containing the item
 * @param itemId - ID of the item to delete
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items
 */
export function deleteFormObject(
  pageNumber: number,
  itemId: string,
  pageFormItems: PageFormItems
): PageFormItems {
  // If no items exist for this page, return the unchanged items
  if (!pageFormItems[pageNumber]) {
    return pageFormItems;
  }
  
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Filter out the specified item
  updatedItems[pageNumber] = pageFormItems[pageNumber].filter(
    item => item.id !== itemId
  );
  
  return updatedItems;
}

/**
 * Get all form objects across all pages
 * 
 * @param pageFormItems - Page-based form items
 * @returns Array of all form items from all pages
 */
export function getAllFormObjects(pageFormItems: PageFormItems): FormItem[] {
  // Flatten all items from all pages into a single array
  return Object.values(pageFormItems).reduce(
    (allItems, pageItems) => [...allItems, ...pageItems],
    [] as FormItem[]
  );
}

/**
 * Move a form object from one page to another
 * 
 * @param fromPage - Source page number
 * @param toPage - Destination page number
 * @param itemId - ID of the item to move
 * @param pageFormItems - Existing page-based form items
 * @returns Updated page-based form items or null if item not found
 */
export function moveFormObject(
  fromPage: number,
  toPage: number,
  itemId: string,
  pageFormItems: PageFormItems
): PageFormItems | null {
  // If source page doesn't exist, return null
  if (!pageFormItems[fromPage]) {
    return null;
  }
  
  // Find the item to move
  const itemToMove = pageFormItems[fromPage].find(item => item.id === itemId);
  
  // If item not found, return null
  if (!itemToMove) {
    return null;
  }
  
  // Create a deep copy to avoid mutation issues
  const updatedItems = { ...pageFormItems };
  
  // Remove the item from the source page
  updatedItems[fromPage] = pageFormItems[fromPage].filter(
    item => item.id !== itemId
  );
  
  // Initialize destination page if it doesn't exist
  if (!updatedItems[toPage]) {
    updatedItems[toPage] = [];
  }
  
  // Add the item to the destination page
  updatedItems[toPage] = [...updatedItems[toPage], itemToMove];
  
  return updatedItems;
}

/**
 * Check if a page has any form objects
 * 
 * @param pageNumber - Page number to check
 * @param pageFormItems - Page-based form items
 * @returns True if the page has items, false otherwise
 */
export function hasPageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): boolean {
  return !!(pageFormItems[pageNumber]?.length > 0);
}

/**
 * Count the number of form objects on a specific page
 * 
 * @param pageNumber - Page number to count items for
 * @param pageFormItems - Page-based form items
 * @returns Number of items on the specified page
 */
export function countPageObjects(
  pageNumber: number,
  pageFormItems: PageFormItems
): number {
  return pageFormItems[pageNumber]?.length || 0;
} 