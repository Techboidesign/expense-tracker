/**
 * events.js
 * Sets up event listeners for the expense tracker
 */

import * as data from './data.js';
import * as ui from './ui.js';
import * as charts from './charts.js';
import * as modals from './modals.js';
import * as exportImport from './exportImport.js';
import * as swipe from './swipe.js'; // Import the new swipe module

// Function to update all UI components after data changes
function updateUIAfterDataChange() {
  ui.renderExpenses();
  ui.renderCardView();
  ui.updateTotals();
  charts.updateCharts();
  ui.renderTopExpenses();
  
  // Update category breakdown
  const isMonthly = document.getElementById('monthly-breakdown-btn').classList.contains('active');
  ui.renderCategoryBreakdown(isMonthly ? 'monthly' : 'yearly');
  
  // Re-initialize swipe functionality
  setTimeout(() => {
    swipe.initializeSwipeFeatures();
  }, 50);
}

// Update UI after filter changes
function updateFilteredUI() {
  // Update filter values
  data.updateFilters({
    type: document.getElementById('filter-type').value,
    recurrence: document.getElementById('filter-recurrence').value
  });
  
  // Render updates to UI
  ui.renderActiveFilters(removeFilter);
  ui.renderExpenses();
  ui.renderCardView();
  charts.updateCharts();
  ui.updateTotals();
  ui.renderTopExpenses();
  
  // Update category breakdown
  const isMonthly = document.getElementById('monthly-breakdown-btn').classList.contains('active');
  ui.renderCategoryBreakdown(isMonthly ? 'monthly' : 'yearly');
  
  // Re-initialize swipe functionality
  setTimeout(() => {
    swipe.initializeSwipeFeatures();
  }, 50);
}

// Remove a specific filter
function removeFilter(filterType) {
  data.removeFilter(filterType);
  
  // Reset UI elements
  if (filterType === 'type') {
    document.getElementById('filter-type').value = '';
  } else if (filterType === 'recurrence') {
    document.getElementById('filter-recurrence').value = '';
  } else if (filterType === 'date') {
    document.getElementById('date-range').value = 'current-month';
    document.getElementById('custom-date-range').style.display = 'none';
  }
  
  updateFilteredUI();
}

// Set up listeners for export/import buttons
function setupExportImportEvents() {
  const exportImportBtn = document.getElementById('export-import-btn');
  const exportImportDropdown = document.getElementById('export-import-dropdown');
  const exportJsonBtn = document.getElementById('export-json');
  const importJsonBtn = document.getElementById('import-json');
  const importFileInput = document.getElementById('import-file-input');
  
  // Export/Import dropdown toggle
  exportImportBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    exportImportDropdown.classList.toggle('show');
  });
  
  // Export button
  exportJsonBtn.addEventListener('click', function(e) {
    e.preventDefault();
    exportImport.exportToJson();
    exportImportDropdown.classList.remove('show');
  });
  
  // Import button - trigger file input
  importJsonBtn.addEventListener('click', function(e) {
    e.preventDefault();
    importFileInput.click();
    exportImportDropdown.classList.remove('show');
  });
  
  // Handle file selection
  importFileInput.addEventListener('change', function(e) {
    exportImport.handleFileSelection(e, (data) => {
      exportImport.showImportPreview(data);
      modals.openImportModal();
    });
  });
  
  // Download buttons
  const downloadBtn = document.getElementById('download-btn');
  const downloadDropdown = document.getElementById('download-dropdown');
  const downloadExcelBtn = document.getElementById('download-excel');
  const printPdfBtn = document.getElementById('print-pdf');
  
  downloadBtn.addEventListener('click', function(e) {
    e.preventDefault();
    downloadDropdown.classList.toggle('show');
  });
  
  downloadExcelBtn.addEventListener('click', function(e) {
    e.preventDefault();
    exportImport.downloadAsExcel();
    downloadDropdown.classList.remove('show');
  });
  
  printPdfBtn.addEventListener('click', function(e) {
    e.preventDefault();
    exportImport.printAsPDF();
    downloadDropdown.classList.remove('show');
  });
  
  // Close dropdown when clicking elsewhere
  window.addEventListener('click', function(e) {
    if (!e.target.matches('#export-import-btn') && !e.target.closest('#export-import-dropdown')) {
      if (exportImportDropdown.classList.contains('show')) {
        exportImportDropdown.classList.remove('show');
      }
    }
    
    if (!e.target.matches('#download-btn') && !e.target.closest('#download-dropdown')) {
      if (downloadDropdown.classList.contains('show')) {
        downloadDropdown.classList.remove('show');
      }
    }
  });
}

// Set up delegated event listeners for dynamic elements
function setupDelegatedEvents() {
  // Delegated event for edit buttons in the table view
  document.addEventListener('click', function(e) {
    // Edit buttons
    if (e.target.closest('.edit-expense-btn')) {
      const button = e.target.closest('.edit-expense-btn');
      const id = button.dataset.id;
      modals.openEditModal(id);
    }
    
    // Delete buttons
    if (e.target.closest('.delete-expense-btn')) {
      const button = e.target.closest('.delete-expense-btn');
      const id = button.dataset.id;
      modals.handleDeleteExpense(id, updateUIAfterDataChange);
    }
  });
  
  // Reset any active swipe states when clicking elsewhere on the page
  document.addEventListener('click', function(e) {
    // If clicked element is not part of a swipe action
    if (!e.target.closest('.swipe-right-container') && 
        !e.target.closest('.swipe-left-container') &&
        !e.target.closest('.row-touching')) {
      
      // Find any row with active swipe states and reset them
      const activeRows = document.querySelectorAll('.swipe-right-locked, .swipe-left-locked');
      if (activeRows.length > 0) {
        activeRows.forEach(row => {
          swipe.resetRowPosition();
        });
      }
    }
  });
  
  // Additional event listeners for handling swipe-specific elements
  document.addEventListener('click', function(e) {
    // Delegate for swipe checkbox
    if (e.target.closest('.swipe-checkbox')) {
      const row = e.target.closest('tr');
      const expenseId = row.querySelector('.edit-expense-btn')?.dataset.id;
      
      if (expenseId) {
        // Toggle a completed state in your data model if needed
        console.log(`Checkbox clicked for expense ID: ${expenseId}`);
        
        // Toggle visual completed state
        row.classList.toggle('expense-completed');
        
        // Reset row position after a short delay
        setTimeout(() => {
          swipe.resetRowPosition();
        }, 300);
      }
    }
  });
}

// Set up handlers to close modals when clicking outside
function setupModalOutsideClickListeners() {
  window.addEventListener('click', (e) => {
    if (e.target === modals.modals.addModal) modals.closeAddModal();
    if (e.target === modals.modals.editModal) modals.closeEditModal();
    if (e.target === modals.modals.budgetModal) modals.closeBudgetModal();
    if (e.target === modals.modals.incomeModal) modals.closeIncomeModal();
    if (e.target === modals.modals.importModal) modals.closeImportModal();
  });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Main action buttons
  document.getElementById('add-expense-btn').addEventListener('click', modals.openAddModal);
  
  // Modal close buttons
  document.getElementById('add-modal-close').addEventListener('click', modals.closeAddModal);
  document.getElementById('edit-modal-close').addEventListener('click', modals.closeEditModal);
  document.getElementById('budget-modal-close').addEventListener('click', modals.closeBudgetModal);
  document.getElementById('income-modal-close').addEventListener('click', modals.closeIncomeModal);
  document.getElementById('import-modal-close').addEventListener('click', modals.closeImportModal);
  
  // Modal cancel buttons
  document.getElementById('cancel-add-btn').addEventListener('click', modals.closeAddModal);
  document.getElementById('cancel-edit-btn').addEventListener('click', modals.closeEditModal);
  document.getElementById('cancel-budget-btn').addEventListener('click', modals.closeBudgetModal);
  document.getElementById('cancel-income-btn').addEventListener('click', modals.closeIncomeModal);
  document.getElementById('cancel-import-btn').addEventListener('click', modals.closeImportModal);
  
  // Modal confirm buttons
  document.getElementById('confirm-add-btn').addEventListener('click', () => {
    modals.handleAddExpense(updateUIAfterDataChange);
  });
  
  document.getElementById('confirm-edit-btn').addEventListener('click', () => {
    modals.handleEditExpense(updateUIAfterDataChange);
  });
  
  document.getElementById('confirm-budget-btn').addEventListener('click', () => {
    modals.handleSetBudget(updateUIAfterDataChange);
  });
  
  document.getElementById('confirm-income-btn').addEventListener('click', () => {
    modals.handleSetIncome(updateUIAfterDataChange);
  });
  
  document.getElementById('confirm-import-btn').addEventListener('click', 
    exportImport.confirmImport);
  
  // Budget and income edit buttons
  document.getElementById('edit-budget-btn').addEventListener('click', modals.openBudgetModal);
  document.getElementById('edit-income-btn').addEventListener('click', modals.openIncomeModal);
  
  // Setup expense type toggle in add modal
  const expenseTypeRadios = document.querySelectorAll('input[name="expense-type"]');
  const recurrenceContainer = document.getElementById('recurrence-container');
  
  expenseTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      recurrenceContainer.style.display = this.value === 'Recurring' ? 'block' : 'none';
    });
  });
  
  // Setup expense type toggle in edit modal
  const editExpenseTypeRadios = document.querySelectorAll('input[name="edit-expense-type"]');
  const editRecurrenceContainer = document.getElementById('edit-recurrence-container');
  
  editExpenseTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      editRecurrenceContainer.style.display = this.value === 'Recurring' ? 'block' : 'none';
    });
  });
  
  // View toggle listeners
  document.getElementById('list-view-btn').addEventListener('click', () => ui.toggleView('list'));
  document.getElementById('card-view-btn').addEventListener('click', () => ui.toggleView('card'));
  
  // Filter listeners
  document.getElementById('filter-type').addEventListener('change', updateFilteredUI);
  document.getElementById('filter-recurrence').addEventListener('change', updateFilteredUI);
  
  // Date range filter
  document.getElementById('date-range').addEventListener('change', function() {
    const value = this.value;
    ui.toggleCustomDateRange(value);
    if (value !== 'custom') {
      updateFilteredUI();
    }
  });
  
  document.getElementById('apply-date-range').addEventListener('click', function() {
    const fromDate = document.getElementById('date-from').value;
    const toDate = document.getElementById('date-to').value;
    
    if (fromDate && toDate) {
      data.setDateRange(new Date(fromDate), new Date(toDate));
      updateFilteredUI();
    }
  });
  
  // Category breakdown toggle
  document.getElementById('monthly-breakdown-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('yearly-breakdown-btn').classList.remove('active');
    ui.renderCategoryBreakdown('monthly');
  });
  
  document.getElementById('yearly-breakdown-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('monthly-breakdown-btn').classList.remove('active');
    ui.renderCategoryBreakdown('yearly');
  });
  
  // Sort buttons
  const sortableHeaders = document.querySelectorAll('th.sortable');
  const sortIcons = document.querySelectorAll('.sort-icon');
  
  sortableHeaders.forEach(header => {
    header.addEventListener('click', function(e) {
      // If clicked directly on the sort icon, don't do anything as the icon has its own handler
      if (e.target.classList.contains('sort-icon')) return;
      
      // Get default sort direction from header's data attribute
      const sortDirection = this.getAttribute('data-sort');
      ui.applySorting(sortDirection);
      updateFilteredUI();
    });
  });
  
  sortIcons.forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent the th click event from firing
      const sortDirection = this.getAttribute('data-sort');
      ui.applySorting(sortDirection);
      updateFilteredUI();
    });
  });
  
  // Export/Import buttons
  setupExportImportEvents();
  
  // Delegate event listeners for dynamic buttons (edit/delete)
  setupDelegatedEvents();
  
  // Close modals when clicking outside
  setupModalOutsideClickListeners();
}

// Make sure to export the necessary functions
export {
  initializeEventListeners,
  updateUIAfterDataChange,
  updateFilteredUI,
  removeFilter
};