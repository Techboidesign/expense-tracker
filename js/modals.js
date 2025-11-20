/**
 * modals.js
 * Handles modal dialogs for expense management
 */

import * as data from './data.js';
import { showElement, hideElement } from './ui.js';
import { validateExpenseData, createExpenseObject } from './utils.js';

// Modal element references
const modals = {
  addModal: document.getElementById('add-modal'),
  editModal: document.getElementById('edit-modal'),
  budgetModal: document.getElementById('budget-modal'),
  incomeModal: document.getElementById('income-modal'),
  importModal: document.getElementById('import-modal')
};

/**
 * Open add expense modal
 */
function openAddModal() {
  // Reset form
  document.getElementById('expense-form').reset();
  
  // Set default values - use Monthly as default
  document.querySelector('input[name="recurrence"][value="Monthly"]').checked = true;
  
  // Set default due date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('due-date').value = today;
  
  showElement(modals.addModal);
}

/**
 * Close add expense modal
 */
function closeAddModal() {
  hideElement(modals.addModal);
}

/**
 * Open edit expense modal and populate with data
 * @param {number} id - Expense ID to edit
 */
function openEditModal(id) {
  // Find the expense by ID
  const expense = data.expenses.find(exp => exp.id === parseInt(id));
  if (!expense) return;
  
  // Populate form fields
  document.getElementById('edit-id').value = expense.id;
  document.getElementById('edit-name').value = expense.name;
  document.getElementById('edit-type').value = expense.category;
  
  // Set the recurrence radio button based on the expense's recurrence
  if (expense.recurrence === 'Monthly') {
    document.getElementById('edit-monthly').checked = true;
  } else if (expense.recurrence === 'Yearly') {
    document.getElementById('edit-yearly').checked = true;
  } else if (expense.recurrence === 'One-time') {
    document.getElementById('edit-one-time').checked = true;
  }
  
  document.getElementById('edit-amount').value = expense.amount;
  document.getElementById('edit-due-date').value = expense.dueDate || '';
  document.getElementById('edit-notes').value = expense.notes || '';
  
  showElement(modals.editModal);
}


/**
 * Close edit expense modal
 */
function closeEditModal() {
  hideElement(modals.editModal);
}

/**
 * Open budget setting modal
 */
function openBudgetModal() {
  document.getElementById('budget-amount').value = data.monthlyBudget || '';
  showElement(modals.budgetModal);
}

/**
 * Close budget setting modal
 */
function closeBudgetModal() {
  hideElement(modals.budgetModal);
}

/**
 * Open income setting modal
 */
function openIncomeModal() {
  document.getElementById('income-amount').value = data.monthlyIncome || '';
  showElement(modals.incomeModal);
}

/**
 * Close income setting modal
 */
function closeIncomeModal() {
  hideElement(modals.incomeModal);
}

/**
 * Open import confirmation modal
 */
function openImportModal() {
  showElement(modals.importModal);
}

/**
 * Close import confirmation modal
 */
function closeImportModal() {
  hideElement(modals.importModal);
}

/**
 * Collect data from add expense form
 * @returns {Object|null} - Expense data or null if invalid
 */
function collectAddExpenseFormData() {
  const name = document.getElementById('name').value.trim();
  const category = document.getElementById('type').value;
  const recurrence = document.querySelector('input[name="recurrence"]:checked').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const dueDate = document.getElementById('due-date').value || null;
  const notes = document.getElementById('notes').value.trim();
  
  const expenseData = { name, category, recurrence, amount, dueDate, notes };
  
  if (!validateExpenseData(expenseData)) {
    alert('Please fill in all required fields correctly.');
    return null;
  }
  
  return expenseData;
}

/**
 * Collect data from edit expense form
 * @returns {Object|null} - Expense data or null if invalid
 */
function collectEditExpenseFormData() {
  const id = parseInt(document.getElementById('edit-id').value);
  const name = document.getElementById('edit-name').value.trim();
  const category = document.getElementById('edit-type').value;
  const recurrence = document.querySelector('input[name="edit-recurrence"]:checked').value;
  const amount = parseFloat(document.getElementById('edit-amount').value);
  const dueDate = document.getElementById('edit-due-date').value || null;
  const notes = document.getElementById('edit-notes').value.trim();
  
  const expenseData = { id, name, category, recurrence, amount, dueDate, notes };
  
  if (!validateExpenseData(expenseData)) {
    alert('Please fill in all required fields correctly.');
    return null;
  }
  
  return expenseData;
}

/**
 * Handle adding a new expense
 * @param {Function} uiUpdateCallback - Callback to update UI after adding
 */
function handleAddExpense(uiUpdateCallback) {
  const expenseData = collectAddExpenseFormData();
  if (!expenseData) return;
  
  const newExpense = createExpenseObject(expenseData);
  data.addExpense(newExpense);
  
  closeAddModal();
  
  if (uiUpdateCallback) {
    uiUpdateCallback();
  }
}

/**
 * Handle editing an existing expense
 * @param {Function} uiUpdateCallback - Callback to update UI after editing
 */
function handleEditExpense(uiUpdateCallback) {
  const expenseData = collectEditExpenseFormData();
  if (!expenseData) return;
  
  const { id, ...updatedData } = expenseData;
  data.updateExpense(id, updatedData);
  
  closeEditModal();
  
  if (uiUpdateCallback) {
    uiUpdateCallback();
  }
}

/**
 * Handle deleting an expense
 * @param {number} id - ID of expense to delete
 * @param {Function} uiUpdateCallback - Callback to update UI after deletion
 */
function handleDeleteExpense(id, uiUpdateCallback) {
  if (confirm('Are you sure you want to delete this expense?')) {
    data.deleteExpense(parseInt(id));
    
    if (uiUpdateCallback) {
      uiUpdateCallback();
    }
  }
}

/**
 * Handle setting monthly budget
 * @param {Function} uiUpdateCallback - Callback to update UI after setting budget
 */
function handleSetBudget(uiUpdateCallback) {
  const amount = parseFloat(document.getElementById('budget-amount').value);
  
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid budget amount.');
    return;
  }
  
  data.setMonthlyBudget(amount);
  closeBudgetModal();
  
  if (uiUpdateCallback) {
    uiUpdateCallback();
  }
}

/**
 * Handle setting monthly income
 * @param {Function} uiUpdateCallback - Callback to update UI after setting income
 */
function handleSetIncome(uiUpdateCallback) {
  const amount = parseFloat(document.getElementById('income-amount').value);
  
  if (isNaN(amount) || amount < 0) {
    alert('Please enter a valid income amount.');
    return;
  }
  
  data.setMonthlyIncome(amount);
  closeIncomeModal();
  
  if (uiUpdateCallback) {
    uiUpdateCallback();
  }
}

export {
  modals,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openBudgetModal,
  closeBudgetModal,
  openIncomeModal,
  closeIncomeModal,
  openImportModal,
  closeImportModal,
  handleAddExpense,
  handleEditExpense,
  handleDeleteExpense,
  handleSetBudget,
  handleSetIncome
};