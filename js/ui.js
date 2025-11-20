/**
 * ui.js
 * Handles UI rendering and view management
 */

import * as data from './data.js';

import { 
  getCategoryColor, 
  createFilterBadge, 
  formatDate, 
  formatCurrency,
  calculateBudgetPercentage,
  getBudgetColor
} from './utils.js';

// UI Elements cache
const elements = {
  expensesTableBody: document.getElementById('expenses-table-body'),
  totalMonthlyElement: document.getElementById('total-monthly'),
  totalYearlyElement: document.getElementById('total-yearly'),
  monthlyBudgetElement: document.getElementById('monthly-budget'),
  budgetProgressBar: document.getElementById('budget-progress-bar'),
  budgetPercentageElement: document.getElementById('budget-percentage'),
  monthlyIncomeElement: document.getElementById('monthly-income'),
  monthlySavingsElement: document.getElementById('monthly-savings'),
  savingsSignElement: document.getElementById('savings-sign'),
  activeFiltersContainer: document.getElementById('active-filters'),
  cardViewActiveFiltersContainer: document.getElementById('card-view-active-filters'),
  cardViewContainer: document.getElementById('card-view-container'),
  topExpensesList: document.getElementById('top-expenses-list'),
  categoryBreakdownList: document.getElementById('category-breakdown-list'),
  customDateRange: document.getElementById('custom-date-range'),
  sortIcons: document.querySelectorAll('.sort-icon'),
  listView: document.getElementById('list-view'),
  cardView: document.getElementById('card-view')
};

/**
 * Initialize UI components
 */
function initializeUI() {
  initSortingState();
  renderExpenses();
  updateTotals();
  updateIncomeDisplay();
  renderTopExpenses();
  updateBudgetDisplay();
  renderCategoryBreakdown('monthly');
}

/**
 * Initialize sorting state in the UI
 */
function initSortingState() {
  // Reset all active sort icons
  elements.sortIcons.forEach(icon => {
    icon.classList.remove('active');
  });
  
  // Set initial active sort icon based on activeFilters.sortBy
  const activeFilters = data.getActiveFilters();
  if (activeFilters.sortBy) {
    const initialActiveIcon = document.querySelector(`.sort-icon[data-sort="${activeFilters.sortBy}"]`);
    if (initialActiveIcon) {
      initialActiveIcon.classList.add('active');
    }
  } else {
    // Default to name-asc if no sort is active
    const defaultIcon = document.querySelector(`.sort-icon[data-sort="name-asc"]`);
    if (defaultIcon) {
      defaultIcon.classList.add('active');
      data.setSorting('name-asc');
    }
  }
}

/**
 * Update UI to reflect active filters
 * @param {Function} removeFilterCallback - Callback to remove a filter
 */
function renderActiveFilters(removeFilterCallback) {
  // Clear both filter containers
  elements.activeFiltersContainer.innerHTML = '';
  elements.cardViewActiveFiltersContainer.innerHTML = '';
  
  const activeFilters = data.getActiveFilters();
  
  // Create filters for list view
  if (activeFilters.type) {
    const badge = createFilterBadge('Category: ' + activeFilters.type, 'type', removeFilterCallback);
    elements.activeFiltersContainer.appendChild(badge);
    
    // Clone for card view
    const cardBadge = createFilterBadge('Category: ' + activeFilters.type, 'type', removeFilterCallback);
    elements.cardViewActiveFiltersContainer.appendChild(cardBadge);
  }
  
  if (activeFilters.recurrence) {
    const badge = createFilterBadge('Type: ' + activeFilters.recurrence, 'recurrence', removeFilterCallback);
    elements.activeFiltersContainer.appendChild(badge);
    
    // Clone for card view
    const cardBadge = createFilterBadge('Type: ' + activeFilters.recurrence, 'recurrence', removeFilterCallback);
    elements.cardViewActiveFiltersContainer.appendChild(cardBadge);
  }
  
  if (activeFilters.dateFrom && activeFilters.dateTo) {
    const fromDate = new Date(activeFilters.dateFrom).toLocaleDateString();
    const toDate = new Date(activeFilters.dateTo).toLocaleDateString();
    const badge = createFilterBadge(`Date: ${fromDate} to ${toDate}`, 'date', removeFilterCallback);
    elements.activeFiltersContainer.appendChild(badge);
    
    // Clone for card view
    const cardBadge = createFilterBadge(`Date: ${fromDate} to ${toDate}`, 'date', removeFilterCallback);
    elements.cardViewActiveFiltersContainer.appendChild(cardBadge);
  }
}

/**
 * Apply sorting to the UI
 * @param {string} sortDirection - How to sort
 */
function applySorting(sortDirection) {
  // Remove active class from all icons
  elements.sortIcons.forEach(icon => {
    icon.classList.remove('active');
  });
  
  // Add active class to the clicked icon
  const activeIcon = document.querySelector(`.sort-icon[data-sort="${sortDirection}"]`);
  if (activeIcon) {
    activeIcon.classList.add('active');
  }
  
  // Update the activeFilters.sortBy value
  data.setSorting(sortDirection);
  
  // Render the expenses with the new sorting
  renderExpenses();
}

/**
 * Toggle date range custom input visibility
 * @param {string} value - Selected date range value
 */
function toggleCustomDateRange(value) {
  if (value === 'custom') {
    elements.customDateRange.style.display = 'flex';
  } else {
    elements.customDateRange.style.display = 'none';
    data.setPredefinedDateRange(value);
  }
}

/**
 * Toggle between list and card view
 * @param {string} view - 'list' or 'card'
 */
function toggleView(view) {
  const listViewBtn = document.getElementById('list-view-btn');
  const cardViewBtn = document.getElementById('card-view-btn');
  
  if (view === 'list') {
    listViewBtn.classList.add('active');
    cardViewBtn.classList.remove('active');
    elements.listView.style.display = 'block';
    elements.cardView.style.display = 'none';
  } else if (view === 'card') {
    cardViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    elements.cardView.style.display = 'block';
    elements.listView.style.display = 'none';
    renderCardView();
  }
}

/**
 * Update expense totals in UI
 */
function updateTotals() {
  let monthlyTotal = data.calculateMonthlyTotal();
  let yearlyTotal = data.calculateYearlyTotal();
  
  elements.totalMonthlyElement.textContent = formatCurrency(monthlyTotal);
  elements.totalYearlyElement.textContent = formatCurrency(yearlyTotal);
  
  updateBudgetDisplay();
  updateIncomeDisplay(); 
}

/**
 * Update budget display in UI
 */
function updateBudgetDisplay() {
  const monthlyBudget = data.monthlyBudget;
  
  if (monthlyBudget > 0) {
    const monthlyTotal = data.calculateMonthlyTotal();
    const percentage = calculateBudgetPercentage(monthlyTotal, monthlyBudget);
    
    elements.monthlyBudgetElement.textContent = formatCurrency(monthlyBudget);
    elements.budgetProgressBar.style.width = percentage + '%';
    elements.budgetPercentageElement.textContent = percentage + '%';
    
    // Update progress bar color based on percentage
    elements.budgetProgressBar.style.backgroundColor = getBudgetColor(percentage);
  } else {
    elements.monthlyBudgetElement.textContent = '0.00';
    elements.budgetProgressBar.style.width = '0%';
    elements.budgetPercentageElement.textContent = '0%';
  }
}

/**
 * Update income and savings display in UI
 */
function updateIncomeDisplay() {
  const monthlyIncome = data.monthlyIncome;
  // Update the income display
  elements.monthlyIncomeElement.textContent = formatCurrency(monthlyIncome);
  
  // Calculate and update savings
  const monthlyTotal = data.calculateMonthlyTotal();
  const monthlySavings = monthlyIncome - monthlyTotal;
  
  // Format the savings amount
  const formattedSavings = Math.abs(monthlySavings).toFixed(2);
  
  // Update the display
  elements.monthlySavingsElement.textContent = formattedSavings;
  
  // Update the sign and apply styling
  if (monthlySavings >= 0) {
    elements.savingsSignElement.textContent = ' $';
    elements.monthlySavingsElement.classList.add('savings-positive');
    elements.monthlySavingsElement.classList.remove('savings-negative');
    elements.savingsSignElement.classList.add('savings-positive');
    elements.savingsSignElement.classList.remove('savings-negative');
  } else {
    elements.savingsSignElement.textContent = '-';
    elements.monthlySavingsElement.classList.add('savings-negative');
    elements.monthlySavingsElement.classList.remove('savings-positive');
    elements.savingsSignElement.classList.add('savings-negative');
    elements.savingsSignElement.classList.remove('savings-positive');
  }
}

/**
 * Render expenses table
 */
function renderExpenses() {
  const filteredExps = data.getFilteredExpenses();
  
  // Clear table
  elements.expensesTableBody.innerHTML = '';
  
  // Check if empty
  if (filteredExps.length === 0) {
    // Your existing empty state code here
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 6;
    emptyCell.className = 'empty-state';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'empty-state-icon';
    iconDiv.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'empty-state-text';
    messageDiv.textContent = 'No expenses found. Add one to get started!';
    
    emptyCell.appendChild(iconDiv);
    emptyCell.appendChild(messageDiv);
    emptyRow.appendChild(emptyCell);
    elements.expensesTableBody.appendChild(emptyRow);
    return;
  }
  
  // Render expenses
  filteredExps.forEach(exp => {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    
    // Name column
    const nameCell = document.createElement('td');
    nameCell.textContent = exp.name;
    row.appendChild(nameCell);
    
    // Category column
    const categoryCell = document.createElement('td');
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `type-badge ${exp.category}`;
    categoryBadge.textContent = exp.category;
    categoryCell.appendChild(categoryBadge);
    row.appendChild(categoryCell);
    
    // Recurrence column
    const recurrenceCell = document.createElement('td');
    const recurrenceBadge = document.createElement('span');
    recurrenceBadge.className = exp.recurrence;
    recurrenceBadge.textContent = exp.recurrence;
    recurrenceCell.appendChild(recurrenceBadge);
    row.appendChild(recurrenceCell);
    
    // Amount column
    const amountCell = document.createElement('td');
    amountCell.textContent = `$${formatCurrency(exp.amount)}`;
    row.appendChild(amountCell);
    
    // Due date column
    const dueDateCell = document.createElement('td');
    dueDateCell.textContent = formatDate(exp.dueDate);
    row.appendChild(dueDateCell);
    
    // Actions column (edit only)
    const actionsCell = document.createElement('td');
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-sm btn-secondary';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = "Edit";
    editButton.dataset.id = exp.id;
    editButton.classList.add('edit-expense-btn');
    
    // Add only the edit button, no delete button
    actionButtons.appendChild(editButton);
    actionsCell.appendChild(actionButtons);
    row.appendChild(actionsCell);
    
    elements.expensesTableBody.appendChild(row);
  });
}


/**
 * Render card view of expenses
 */
function renderCardView() {
  // Clear the container first
  elements.cardViewContainer.innerHTML = '';
  
  const filteredExps = data.getFilteredExpenses();
  
  // Handle empty state
  if (filteredExps.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'card-empty-state';
    emptyState.innerHTML = '<div class="empty-state-icon"><i class="fas fa-money-bill-wave"></i></div><div class="empty-state-text">No expenses found. Add one to get started!</div>';
    elements.cardViewContainer.appendChild(emptyState);
    return;
  }
  
  // Create a card for each expense
  filteredExps.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'expense-card';
    
    // First row container
    const firstRow = document.createElement('div');
    firstRow.className = 'expense-card-row';
    firstRow.style.display = 'flex';
    firstRow.style.alignItems = 'center';
    firstRow.style.width = '100%';
    firstRow.style.marginBottom = '0.5rem';
    
    // Expense name
    const name = document.createElement('div');
    name.className = 'expense-card-title';
    name.textContent = exp.name;
    name.title = exp.name; // Add tooltip for truncated text
    name.style.flexGrow = '1';
    name.style.overflow = 'hidden';
    name.style.textOverflow = 'ellipsis';
    name.style.whiteSpace = 'nowrap';
    firstRow.appendChild(name);
    
    // Amount
    const amount = document.createElement('div');
    amount.className = 'expense-card-amount';
    amount.textContent = `$${formatCurrency(exp.amount)}`;
    amount.style.marginLeft = '0.75rem';
    firstRow.appendChild(amount);
    
    // Second row container
    const secondRow = document.createElement('div');
    secondRow.className = 'expense-card-row';
    secondRow.style.display = 'flex';
    secondRow.style.alignItems = 'center';
    secondRow.style.width = '100%';
    
    // Left section for category and recurrence 
    const leftSection = document.createElement('div');
    leftSection.style.display = 'flex';
    leftSection.style.alignItems = 'center';
    leftSection.style.flexGrow = '1';
    
    // Category badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `type-badge ${exp.category}`;
    categoryBadge.textContent = exp.category;
    leftSection.appendChild(categoryBadge);
    
    // Recurrence badge
    const recurrenceBadge = document.createElement('div');
    recurrenceBadge.className = `expense-type-badge ${exp.recurrence}`;
    recurrenceBadge.textContent = exp.recurrence;
    recurrenceBadge.style.marginLeft = '0.5rem';
    leftSection.appendChild(recurrenceBadge);
    
    // Due date if applicable
    if (exp.dueDate) {
      const date = document.createElement('div');
      date.className = 'expense-card-due-date';
      date.textContent = `Due: ${formatDate(exp.dueDate)}`;
      date.style.marginLeft = '1rem';
      date.style.fontSize = '0.75rem';
      date.style.color = 'var(--muted-foreground)';
      leftSection.appendChild(date);
    }
    
    secondRow.appendChild(leftSection);
    
    // Action buttons container (edit only)
    const actions = document.createElement('div');
    actions.className = 'action-buttons';
    actions.style.marginLeft = 'auto';
    
    // Edit button
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-sm btn-secondary edit-expense-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = "Edit";
    editButton.dataset.id = exp.id;
    actions.appendChild(editButton);
    
    // Only add the edit button
    secondRow.appendChild(actions);
    
    // Add all elements to the card
    card.appendChild(firstRow);
    card.appendChild(secondRow);
    
    elements.cardViewContainer.appendChild(card);
  });
}

/**
 * Render top expenses section
 */
function renderTopExpenses() {
  // Get the top expenses by amount
  const topExps = data.getTopExpenses(8);
  
  elements.topExpensesList.innerHTML = '';

  
  // Render each top expense in a simple row format
  topExps.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'top-expense-item';
    
    // Category badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `type-badge ${exp.category}`;
    categoryBadge.textContent = exp.category;
    
    // Expense name
    const name = document.createElement('span');
    name.className = 'top-expense-name';
    name.textContent = exp.name;
    
    // Amount
    const amount = document.createElement('span');
    amount.className = 'top-expense-amount';
    amount.textContent = `$${formatCurrency(exp.amount)}`;
    
    // Add elements to the card
    card.appendChild(categoryBadge);
    card.appendChild(name);
    card.appendChild(amount);
    
    elements.topExpensesList.appendChild(card);
  });
}

/**
 * Render category breakdown
 * @param {string} period - 'monthly' or 'yearly'
 */
function renderCategoryBreakdown(period = 'monthly') {
  elements.categoryBreakdownList.innerHTML = '';
  
  // Get category sums with prorated one-time expenses
  const { categorySums, totalSum } = getProratedCategorySums(period);
  
  // Sort categories by amount (descending)
  const sortedCategories = Object.keys(categorySums).sort((a, b) => {
    return categorySums[b] - categorySums[a];
  });
  
  // Render each category
  sortedCategories.forEach(category => {
    const amount = categorySums[category];
    const percentage = totalSum > 0 ? ((amount / totalSum) * 100).toFixed(1) : 0;
    
    const item = document.createElement('div');
    item.className = 'category-breakdown-item';
    
    // Category badge
    const badge = document.createElement('span');
    badge.className = `category-badge ${category}`;
    badge.textContent = category;
    
    // Category text (name)
    const nameSpan = document.createElement('span');
    nameSpan.className = 'category-name';
    nameSpan.textContent = category;
    
    const amountDiv = document.createElement('div');
    amountDiv.className = 'category-amount';
    
    const amountSpan = document.createElement('span');
    amountSpan.textContent = `$${formatCurrency(amount)}`;
    
    const percentageSpan = document.createElement('span');
    percentageSpan.className = 'category-percentage';
    percentageSpan.textContent = `${percentage}%`;
    
    // Append to the item
    item.appendChild(badge);
    item.appendChild(nameSpan);
    
    amountDiv.appendChild(amountSpan);
    amountDiv.appendChild(percentageSpan);
    item.appendChild(amountDiv);
    
    elements.categoryBreakdownList.appendChild(item);
  });
  
  // Add total row
  if (sortedCategories.length > 0) {
    const totalItem = document.createElement('div');
    totalItem.className = 'category-breakdown-item';
    totalItem.style.borderTop = '2px solid var(--border)';
    totalItem.style.fontWeight = 'bold';
    
    const totalName = document.createElement('div');
    totalName.textContent = 'Total';
    
    const totalAmount = document.createElement('div');
    totalAmount.textContent = `$${formatCurrency(totalSum)}`;
    
    totalItem.appendChild(totalName);
    totalItem.appendChild(totalAmount);
    
    elements.categoryBreakdownList.appendChild(totalItem);
  }
}

/**
 * Get prorated category sums based on period
 * @param {string} period - 'monthly' or 'yearly'
 * @returns {Object} - Category sums and total
 */

function getProratedCategorySums(period) {
  // Get filtered expenses
  const filteredExpenses = data.getFilteredExpenses();
  const categorySums = {};
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
      // For one-time expenses in monthly view, prorate by dividing by 12
      if (period === 'monthly') {
        amount = exp.amount / 12;
      } else {
        // For yearly view, show the full amount
        amount = exp.amount;
      }
    }
    
    // Add to the category total
    categorySums[category] += amount;
    totalSum += amount;
  });
  
  return { categorySums, totalSum };
}

/**
 * Get proper category sums based on period with one-time expenses handled correctly
 * @param {string} period - 'monthly' or 'yearly'
 * @returns {Object} - Category sums and total
 */
function getProperCategorySums(period) {
  // Get filtered expenses
  const filteredExpenses = data.getFilteredExpenses();
  const categorySums = {};
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
      amount = exp.amount;
    } 
    else if (exp.recurrence === 'Yearly') {
      // For yearly expenses in monthly view, divide by 12
      if (period === 'monthly') {
        amount = exp.amount / 12;
      } else {
        amount = exp.amount;
      }
    } 
    else if (exp.recurrence === 'One-time') {
      // For one-time expenses in monthly view, prorate by dividing by 12
      if (period === 'monthly') {
        amount = exp.amount / 12;
      } else {
        // For yearly view, show the full amount
        amount = exp.amount;
      }
    }
    
    // Add to the category total
    categorySums[category] += amount;
    totalSum += amount;
  });
  
  return { categorySums, totalSum };
}

// Show/hide modal utility functions
function showElement(element) {
  element.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function hideElement(element) {
  element.style.display = 'none';
  document.body.style.overflow = '';
}

// Export all functions
export {
  elements,
  initializeUI,
  renderActiveFilters,
  applySorting,
  toggleCustomDateRange,
  toggleView,
  updateTotals,
  updateBudgetDisplay,
  updateIncomeDisplay,
  renderExpenses,
  renderCardView,
  renderTopExpenses,
  renderCategoryBreakdown,
  showElement,
  hideElement
};