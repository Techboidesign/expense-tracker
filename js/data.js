/**
 * data.js
 * Handles expense data management, filtering, and persistence
 */

import * as supabaseClient from './supabase-client.js';

// Main data store
let expenses = [];
let monthlyBudget = 0;
let monthlyIncome = 0;

// Active filters state
let activeFilters = {
  type: '',
  recurrence: '',
  sortBy: 'name-asc',
  dateFrom: null,
  dateTo: null
};

/**
 * Initialize data from Supabase or localStorage
 */
async function initializeData() {
  if (supabaseClient.isLoggedIn()) {
    await loadFromSupabase();
  } else {
    expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
    monthlyIncome = parseFloat(localStorage.getItem('monthlyIncome')) || 0;
  }
}

/**
 * Load data from Supabase
 */
async function loadFromSupabase() {
  const user = supabaseClient.getCurrentUser();
  if (!user) {
    console.log('No user logged in, skipping Supabase load');
    return;
  }

  const { data, error } = await supabaseClient.getExpenses();

  if (error) {
    console.error('Error loading from Supabase:', error);
    return;
  }

  expenses = data.map(exp => ({
    id: exp.id,
    name: exp.name,
    category: exp.category,
    recurrence: exp.recurrence,
    amount: parseFloat(exp.amount),
    dueDate: exp.due_date,
    notes: exp.notes || '',
    createdAt: exp.created_at
  }));

  monthlyBudget = parseFloat(user.monthly_budget) || 0;
  monthlyIncome = parseFloat(user.monthly_income) || 0;

  console.log(`Loaded ${expenses.length} expenses from Supabase`);
}

/**
 * Save expenses to localStorage
 */
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

/**
 * Add a new expense
 * @param {Object} expense - The expense object to add
 */
async function addExpense(expense) {
  if (supabaseClient.isLoggedIn()) {
    const expenseData = {
      id: expense.id,
      name: expense.name,
      category: expense.category,
      recurrence: expense.recurrence,
      amount: expense.amount,
      due_date: expense.dueDate,
      notes: expense.notes || ''
    };

    const { data, error } = await supabaseClient.addExpense(expenseData);

    if (error) {
      console.error('Error adding expense to Supabase:', error);
      alert('Error saving expense: ' + error);
      return;
    }

    expenses.push(expense);
  } else {
    expenses.push(expense);
    saveExpenses();
  }
}

/**
 * Update an existing expense
 * @param {number} id - The ID of the expense to update
 * @param {Object} updatedExpense - The updated expense data
 * @returns {boolean} - Whether the update was successful
 */
async function updateExpense(id, updatedExpense) {
  const index = expenses.findIndex(exp => exp.id === id);

  if (index !== -1) {
    if (supabaseClient.isLoggedIn()) {
      const updates = {
        name: updatedExpense.name,
        category: updatedExpense.category,
        recurrence: updatedExpense.recurrence,
        amount: updatedExpense.amount,
        due_date: updatedExpense.dueDate,
        notes: updatedExpense.notes || ''
      };

      const { error } = await supabaseClient.updateExpense(id, updates);

      if (error) {
        console.error('Error updating expense in Supabase:', error);
        alert('Error updating expense: ' + error);
        return false;
      }
    }

    expenses[index] = {
      ...expenses[index],
      ...updatedExpense
    };

    if (!supabaseClient.isLoggedIn()) {
      saveExpenses();
    }
    return true;
  }

  return false;
}

/**
 * Delete an expense by ID
 * @param {number} id - The ID of the expense to delete
 * @returns {boolean} - Whether the deletion was successful
 */
async function deleteExpense(id) {
  const initialLength = expenses.length;

  if (supabaseClient.isLoggedIn()) {
    const { error } = await supabaseClient.deleteExpense(id);

    if (error) {
      console.error('Error deleting expense from Supabase:', error);
      alert('Error deleting expense: ' + error);
      return false;
    }
  }

  expenses = expenses.filter(exp => exp.id !== id);

  if (expenses.length < initialLength) {
    if (!supabaseClient.isLoggedIn()) {
      saveExpenses();
    }
    return true;
  }

  return false;
}

/**
 * Set monthly budget and save to Supabase or localStorage
 * @param {number} amount - The budget amount
 */
async function setMonthlyBudget(amount) {
  monthlyBudget = amount;

  if (supabaseClient.isLoggedIn()) {
    await supabaseClient.updateUserBudget(amount, undefined);
  } else {
    localStorage.setItem('monthlyBudget', amount);
  }
}

/**
 * Set monthly income and save to Supabase or localStorage
 * @param {number} amount - The income amount
 */
async function setMonthlyIncome(amount) {
  monthlyIncome = amount;

  if (supabaseClient.isLoggedIn()) {
    await supabaseClient.updateUserBudget(undefined, amount);
  } else {
    localStorage.setItem('monthlyIncome', amount);
  }
}

/**
 * Get currently applied filters
 * @returns {Object} - The current filter state
 */
function getActiveFilters() {
  return { ...activeFilters };
}

/**
 * Update active filters
 * @param {Object} filters - The filter values to update
 */
function updateFilters(filters) {
  activeFilters = {
    ...activeFilters,
    ...filters
  };
}

/**
 * Remove a specific filter
 * @param {string} filterType - The type of filter to remove
 */
function removeFilter(filterType) {
  if (filterType === 'type') {
    activeFilters.type = '';
  } else if (filterType === 'recurrence') {
    activeFilters.recurrence = '';
  } else if (filterType === 'date') {
    activeFilters.dateFrom = null;
    activeFilters.dateTo = null;
  }
}

/**
 * Set date range for filtering
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 */
function setDateRange(fromDate, toDate) {
  activeFilters.dateFrom = fromDate;
  activeFilters.dateTo = toDate;
}

/**
 * Set predefined date range
 * @param {string} range - Predefined range (e.g., 'current-month', 'year-to-date')
 */
function setPredefinedDateRange(range) {
  const today = new Date();
  let fromDate, toDate;
  
  switch (range) {
    case 'current-year':
      fromDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
      toDate = new Date(today.getFullYear(), 11, 31); // December 31st of current year
      break;
    case 'current-month':
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'last-month':
      fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      toDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'last-3-months':
      fromDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      toDate = today;
      break;
    case 'year-to-date':
      fromDate = new Date(today.getFullYear(), 0, 1);
      toDate = today;
      break;
    default:
      return;
  }
  
  setDateRange(fromDate, toDate);
}

/**
 * Apply sorting to expenses
 * @param {string} sortBy - How to sort (e.g., 'name-asc', 'amount-desc')
 */
function setSorting(sortBy) {
  activeFilters.sortBy = sortBy;
}

/**
 * Get filtered expenses based on current filters
 * @returns {Array} - Filtered and sorted expenses
 */
function getFilteredExpenses() {
  let filteredExps = expenses.filter(exp => {
    // Apply category filter
    if (activeFilters.type && exp.category !== activeFilters.type) return false;
    
    // Apply recurrence filter
    if (activeFilters.recurrence && exp.recurrence !== activeFilters.recurrence) return false;
    
    // Date range filter - with improved handling of one-time expenses
    if (activeFilters.dateFrom && activeFilters.dateTo) {
      const expDate = new Date(exp.dueDate);
      
      // Check if the date is valid before comparing
      if (isNaN(expDate.getTime())) {
        console.warn('Invalid date for expense:', exp.name);
        return false;
      }
      
      // For one-time expenses, use special handling to ensure they show up correctly
      if (exp.recurrence === 'One-time') {
        // If the due date is within the filter range, include it
        if (expDate >= activeFilters.dateFrom && expDate <= activeFilters.dateTo) {
          return true;
        }
        
        // For year-based filters, include if it's in the same year
        const inCurrentYear = expDate.getFullYear() === new Date().getFullYear();
        const filterIncludesCurrentYear = 
          activeFilters.dateFrom.getFullYear() <= new Date().getFullYear() && 
          activeFilters.dateTo.getFullYear() >= new Date().getFullYear();
        
        if (inCurrentYear && filterIncludesCurrentYear) {
          return true;
        }
      } else {
        // For recurring expenses, use standard date filtering
        if (expDate < activeFilters.dateFrom || expDate > activeFilters.dateTo) {
          return false;
        }
      }
    }
    
    return true;
  });
  
  // Log filtered expenses for debugging
  console.log('Filtered expenses:', filteredExps.length, 'expenses match filters');
  
  // Apply sorting
  return sortExpenses(filteredExps, activeFilters.sortBy);
}

/**
 * Sort expenses based on criteria
 * @param {Array} exps - Expenses to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} - Sorted expenses
 */
function sortExpenses(exps, sortBy) {
  return [...exps].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'category-asc':
        return a.category.localeCompare(b.category);
      case 'category-desc':
        return b.category.localeCompare(a.category);
      case 'recurrence-asc':
        // Custom order: Monthly, then Yearly, then One-time
        const recurrenceOrder = { 'Monthly': 0, 'Yearly': 1, 'One-time': 2 };
        return recurrenceOrder[a.recurrence] - recurrenceOrder[b.recurrence];
      case 'recurrence-desc':
        // Reverse order: One-time, then Yearly, then Monthly
        const reverseRecurrenceOrder = { 'One-time': 0, 'Yearly': 1, 'Monthly': 2 };
        return reverseRecurrenceOrder[a.recurrence] - reverseRecurrenceOrder[b.recurrence];
      case 'amount-asc':
        return a.amount - b.amount;
      case 'amount-desc':
        return b.amount - a.amount;
      case 'date-asc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'date-desc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      default:
        return 0;
    }
  });
}

/**
 * Get top expenses by amount
 * @param {number} limit - Maximum number of expenses to return
 * @returns {Array} - Top expenses sorted by amount
 */
function getTopExpenses(limit = 8) {
  const filteredExps = getFilteredExpenses();
  return [...filteredExps]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Calculate the monthly total based on current filters
 * @returns {number} - Monthly total
 */
function calculateMonthlyTotal() {
  let total = 0;
  const filteredExpenses = getFilteredExpenses();
  const recurrenceFilter = activeFilters.recurrence;
  
  filteredExpenses.forEach(exp => {
    if (exp.recurrence === 'Monthly') {
      total += exp.amount;
    } else if (exp.recurrence === 'Yearly') {
      total += exp.amount / 12;
    } else if (exp.recurrence === 'One-time') {
      // Special handling for one-time expenses
      if (recurrenceFilter === 'One-time') {
        // If we're specifically filtering for one-time expenses, include them all
        total += exp.amount;
      } else {
        // Otherwise, only count if due date is in current month
        if (exp.dueDate) {
          const dueDate = new Date(exp.dueDate);
          const today = new Date();
          if (dueDate.getMonth() === today.getMonth() && dueDate.getFullYear() === today.getFullYear()) {
            total += exp.amount;
          }
        }
      }
    }
  });
  
  return total;
}

/**
 * Calculate the yearly total based on current filters
 * @returns {number} - Yearly total
 */
function calculateYearlyTotal() {
  let total = 0;
  const filteredExpenses = getFilteredExpenses();
  const recurrenceFilter = activeFilters.recurrence;
  
  filteredExpenses.forEach(exp => {
    if (exp.recurrence === 'Monthly') {
      total += exp.amount * 12;
    } else if (exp.recurrence === 'Yearly') {
      total += exp.amount;
    } else if (exp.recurrence === 'One-time') {
      // Special handling for one-time expenses
      if (recurrenceFilter === 'One-time') {
        // If we're specifically filtering for one-time expenses, include them all
        total += exp.amount;
      } else {
        // Otherwise, only count if due date is in current year
        if (exp.dueDate) {
          const dueDate = new Date(exp.dueDate);
          const today = new Date();
          if (dueDate.getFullYear() === today.getFullYear()) {
            total += exp.amount;
          }
        }
      }
    }
  });
  
  return total;
}

/**
 * Get category sums for chart or breakdown
 * @param {string} period - 'monthly' or 'yearly'
 * @returns {Object} - Category sums
 */
function getCategorySums(period = 'monthly') {
  const categorySums = {};
  const filteredExpenses = getFilteredExpenses();
  let totalSum = 0;
  
  // Process each filtered expense
  filteredExpenses.forEach(exp => {
    const category = exp.category;
    if (!categorySums[category]) {
      categorySums[category] = 0;
    }
    
    let amount = 0;
    
    // Calculate the amount based on recurrence type and period
    if (exp.recurrence === 'Monthly') {
      amount = period === 'monthly' ? exp.amount : exp.amount * 12;
    } 
    else if (exp.recurrence === 'Yearly') {
      amount = period === 'monthly' ? exp.amount / 12 : exp.amount;
    } 
    else if (exp.recurrence === 'One-time') {
      // For one-time expenses, prorate monthly by dividing by 12
      if (period === 'monthly') {
        amount = exp.amount / 12; // Divide by 12 for monthly view
      } else {
        // For yearly view, use the full amount
        amount = exp.amount;
      }
    }
    
    // Add to the category total
    categorySums[category] += amount;
    totalSum += amount;
  });
  
  // Return both the category breakdown and the total
  return { categorySums, totalSum };
}

// Add a migration function to update existing expense data structure
function migrateExpensesData() {
  let needsMigration = false;
  
  // Check if any expense has the old structure
  expenses.forEach(exp => {
    if (exp.hasOwnProperty('expenseType') && !exp.hasOwnProperty('recurrence')) {
      needsMigration = true;
    }
  });
  
  // If migration needed, update all expenses
  if (needsMigration) {
    expenses = expenses.map(exp => {
      // If already in new format, return as is
      if (!exp.hasOwnProperty('expenseType')) {
        return exp;
      }
      
      // Create new expense with updated structure
      const newExp = { ...exp };
      
      // Set recurrence based on old structure
      if (exp.expenseType === 'Recurring') {
        newExp.recurrence = exp.recurrence || 'Monthly';
      } else {
        newExp.recurrence = 'One-time';
      }
      
      // Remove old properties
      delete newExp.expenseType;
      
      return newExp;
    });
    
    // Save the migrated data
    saveExpenses();
    console.log('Expense data migrated to new recurrence structure');
  }
}

// Export the functions and data
export {
  expenses,
  monthlyBudget,
  monthlyIncome,
  activeFilters,
  initializeData,
  saveExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setMonthlyBudget,
  setMonthlyIncome,
  getActiveFilters,
  updateFilters,
  removeFilter,
  setDateRange,
  setPredefinedDateRange,
  setSorting,
  getFilteredExpenses,
  sortExpenses,
  getTopExpenses,
  calculateMonthlyTotal,
  calculateYearlyTotal,
  getCategorySums,
  migrateExpensesData,
  loadFromSupabase,
  clearAllExpenses
};