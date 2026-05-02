// Input validation and sanitization utilities
import { SORT_OPTIONS, MAX_LENGTHS, CATEGORY_FILTER } from '../constants/index.ts';

/**
 * Validates and sanitizes search query input
 * @param {string} query - Raw search query from user input
 * @returns {string} Sanitized query string
 */
export function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';

  // Remove any HTML tags
  const withoutTags = query.replace(/<[^>]*>/g, '');

  // Remove special characters that could be used for injection
  const sanitized = withoutTags.replace(/[<>\"'`]/g, '');

  // Trim and limit length
  return sanitized.trim().slice(0, MAX_LENGTHS.SEARCH_QUERY);
}

/**
 * Validates category slug against allowed values
 * @param {string} category - Category slug from URL parameter
 * @param {string[]} allowedCategories - Array of valid category slugs
 * @returns {string} Valid category slug or 'all'
 */
export function validateCategory(category, allowedCategories) {
  if (typeof category !== 'string') return CATEGORY_FILTER.ALL;

  const sanitized = category.toLowerCase().trim();

  // Check if it's in the allowed list
  if (allowedCategories.includes(sanitized)) {
    return sanitized;
  }

  return CATEGORY_FILTER.ALL;
}

/**
 * Validates sort parameter against allowed values
 * @param {string} sort - Sort parameter from URL
 * @returns {string} Valid sort value or 'featured'
 */
export function validateSort(sort) {
  const allowedSorts = Object.values(SORT_OPTIONS);

  if (typeof sort !== 'string') return SORT_OPTIONS.FEATURED;

  const sanitized = sort.toLowerCase().trim();

  if (allowedSorts.includes(sanitized)) {
    return sanitized;
  }

  return SORT_OPTIONS.FEATURED;
}

/**
 * Sanitizes URL parameter to prevent XSS
 * @param {string} param - Raw URL parameter
 * @returns {string} Sanitized parameter
 */
export function sanitizeUrlParam(param) {
  if (typeof param !== 'string') return '';

  // Remove any HTML/script tags
  const withoutTags = param.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters
  const sanitized = withoutTags.replace(/[<>\"'`;&()]/g, '');

  return sanitized.trim();
}

/**
 * Validates game slug format
 * @param {string} slug - Game slug from URL
 * @returns {string|null} Valid slug or null
 */
export function validateGameSlug(slug) {
  if (typeof slug !== 'string') return null;

  // Game slugs should only contain lowercase letters, numbers, and hyphens
  const slugPattern = /^[a-z0-9-]+$/;

  if (slugPattern.test(slug) && slug.length <= MAX_LENGTHS.GAME_SLUG) {
    return slug;
  }

  return null;
}
