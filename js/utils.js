/**
 * utils.js
 * Utility functions for the expense tracker
 */

/**
 * Category configuration with icons and colors
 */
const CATEGORIES = [
  { name: 'Housing', icon: 'fa-home', color: '#4f46e5' },
  { name: 'Utilities', icon: 'fa-bolt', color: '#06b6d4' },
  { name: 'Transportation', icon: 'fa-car', color: '#f59e0b' },
  { name: 'Food', icon: 'fa-utensils', color: '#10b981' },
  { name: 'Entertainment', icon: 'fa-film', color: '#8b5cf6' },
  { name: 'Health', icon: 'fa-heartbeat', color: '#ec4899' },
  { name: 'Personal', icon: 'fa-user', color: '#3b82f6' },
  { name: 'Subscriptions', icon: 'fa-credit-card', color: '#6366f1' },
  { name: 'Education', icon: 'fa-graduation-cap', color: '#9c27b0' },
  { name: 'Other', icon: 'fa-ellipsis-h', color: '#6b7280' }
];

/**
 * Get category icon
 * @param {string} category - Expense category
 * @returns {string} - FontAwesome icon class
 */
function getCategoryIcon(category) {
  const cat = CATEGORIES.find(c => c.name === category);
  return cat ? cat.icon : 'fa-ellipsis-h';
}

/**
 * Get color for a specific category
 * @param {string} category - Expense category
 * @returns {string} - Hex color code
 */
function getCategoryColor(category) {
  const cat = CATEGORIES.find(c => c.name === category);
  return cat ? cat.color : '#6b7280';
}
  
  /**
   * Create a filter badge element
   * @param {string} text - Badge text
   * @param {string} filterType - Type of filter
   * @param {Function} removeFilterCallback - Callback for when filter is removed
   * @returns {HTMLElement} - The created badge element
   */
  function createFilterBadge(text, filterType, removeFilterCallback) {
    const badge = document.createElement('div');
    badge.className = 'filter-badge';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    
    const removeButton = document.createElement('span');
    removeButton.className = 'remove';
    removeButton.innerHTML = '×';
    removeButton.addEventListener('click', () => removeFilterCallback(filterType));
    
    badge.appendChild(textSpan);
    badge.appendChild(removeButton);
    
    return badge;
  }
  
  /**
   * Format a date to locale string
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  function formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  /**
   * Format a currency amount
   * @param {number} amount - Amount to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted amount
   */
  function formatCurrency(amount, decimals = 2) {
    return amount.toFixed(decimals);
  }
  
  /**
   * Calculate budget percentage
   * @param {number} current - Current amount
   * @param {number} budget - Budget amount
   * @returns {number} - Percentage (0-100)
   */
  function calculateBudgetPercentage(current, budget) {
    if (budget <= 0) return 0;
    return Math.min(100, Math.round((current / budget) * 100));
  }
  
  /**
   * Get budget color based on percentage
   * @param {number} percentage - Budget percentage
   * @returns {string} - CSS variable for color
   */
  function getBudgetColor(percentage) {
    if (percentage < 70) {
      return 'var(--budget-good)';
    } else if (percentage < 90) {
      return 'var(--budget-warning)';
    } else {
      return 'var(--budget-danger)';
    }
  }
  
  /**
   * Create a new expense object
   * @param {Object} data - Expense data
   * @returns {Object} - Formatted expense object
   */
  function createExpenseObject(data) {
    return {
      id: Date.now(),
      name: data.name,
      category: data.category,
      recurrence: data.recurrence,  
      amount: parseFloat(data.amount),
      dueDate: data.dueDate || null,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * Validate expense data
   * @param {Object} data - Expense data to validate
   * @returns {boolean} - Whether the data is valid
   */
  function validateExpenseData(data) {
    return (
      data.name.trim() !== '' &&
      data.category !== '' &&
      data.recurrence !== '' &&  
      !isNaN(data.amount) &&
      data.amount > 0 &&
      data.dueDate
    );
  }
  
  export {
    CATEGORIES,
    getCategoryIcon,
    getCategoryColor,
    createFilterBadge,
    formatDate,
    formatCurrency,
    calculateBudgetPercentage,
    getBudgetColor,
    createExpenseObject,
    validateExpenseData
  };