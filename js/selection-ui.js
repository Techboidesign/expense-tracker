/**
 * Selection functionality for expense tracker
 * This module handles the selection UI for multiple expense deletion
 */

// Keep track of selected expenses
let selectedExpenses = [];
let selectionActive = false;

/**
 * Initialize selection UI functionality
 */
function initializeSelectionUI() {
  // Add checkbox containers to each row in the table
  addCheckboxesToTable();
  
  // Create the selection controls panel
  createSelectionControls();
  
  // Create the delete confirmation modal
  createDeleteConfirmationModal();
  
  // Add event listener for table changes (for when expenses are added/removed)
  observeTableChanges();
  
  // Add event listener for card view changes
  observeCardViewChanges();
  
  // Listen for view toggle to update selection state
  listenForViewToggle();
}

/**
 * Add checkboxes to all expense rows
 */
function addCheckboxesToTable() {
  // Original table implementation remains the same
  const tableBody = document.getElementById('expenses-table-body');
  if (tableBody) {
    // Add checkboxes to all existing rows
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      if (!row.querySelector('.checkbox-container')) {
        addCheckboxToRow(row);
      }
    });
  }
  
  // Now handle card view
  setupCardViewSelection();
}

/**
 * Add checkbox to a single row
 * @param {HTMLElement} row - The table row element
 */
function addCheckboxToRow(row) {
  // Only add if the row doesn't already have a checkbox
  if (row.querySelector('.checkbox-container')) return;
  
  // Get the first cell (name cell)
  const firstCell = row.querySelector('td');
  if (!firstCell) return;
  
  // Create checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'checkbox-container';
  
  // Create checkbox input
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox-custom';
  
  // Extract expense ID from the row
  const expenseId = getExpenseIdFromRow(row);
  if (expenseId) {
    checkbox.dataset.id = expenseId;
  }
  
  // Add event listener to checkbox
  checkbox.addEventListener('change', function() {
    handleCheckboxChange(this, row);
  });
  
  // Append checkbox to container
  checkboxContainer.appendChild(checkbox);
  
  // Add checkbox container to the first cell
  firstCell.appendChild(checkboxContainer);
  
  // Make the whole row clickable for selection
  row.addEventListener('click', function(e) {
    // Skip if clicked on edit button or checkbox
    if (e.target.closest('.edit-expense-btn') || e.target.closest('.checkbox-container')) {
      return;
    }
    
    // Find the checkbox
    const rowCheckbox = row.querySelector('.checkbox-custom');
    if (!rowCheckbox) return;
    
    // Toggle checkbox state
    rowCheckbox.checked = !rowCheckbox.checked;
    
    // Trigger change event on the checkbox to handle the selection logic
    const changeEvent = new Event('change', { bubbles: true });
    rowCheckbox.dispatchEvent(changeEvent);
  });
}

/**
 * Get expense ID from a table row
 * @param {HTMLElement} row - Table row element
 * @returns {string|null} - Expense ID or null if not found
 */
function getExpenseIdFromRow(row) {
  // Try to find an action button with a data-id attribute
  const actionButton = row.querySelector('.edit-expense-btn, .delete-expense-btn');
  if (actionButton && actionButton.dataset.id) {
    return actionButton.dataset.id;
  }
  return null;
}

/**
 * Handle checkbox change event
 * @param {HTMLElement} checkbox - The checkbox element
 * @param {HTMLElement} row - The row element
 */
function handleCheckboxChange(checkbox, row) {
  const expenseId = checkbox.dataset.id;
  
  // Toggle row selection class
  row.classList.toggle('selected', checkbox.checked);
  
  // Update selected expenses array
  if (checkbox.checked && expenseId) {
    if (!selectedExpenses.includes(expenseId)) {
      selectedExpenses.push(expenseId);
    }
  } else {
    selectedExpenses = selectedExpenses.filter(id => id !== expenseId);
  }
  
  // Toggle selection mode
  if (selectedExpenses.length > 0 && !selectionActive) {
    activateSelectionMode();
  } else if (selectedExpenses.length === 0 && selectionActive) {
    deactivateSelectionMode();
  }
  
  // Update selection counter
  updateSelectionCounter();
  
  // Update card view if it's visible
  updateCardSelectionState();
}

/**
 * Set up selection functionality for card view
 */
function setupCardViewSelection() {
  const cardContainer = document.getElementById('card-view-container');
  if (!cardContainer) return;
  
  // Add checkboxes to all existing cards
  const cards = cardContainer.querySelectorAll('.expense-card');
  cards.forEach(card => {
    if (!card.querySelector('.checkbox-container')) {
      addCheckboxToCard(card);
    }
  });
}

/**
 * Add checkbox and click handling to a card
 * @param {HTMLElement} card - The card element
 */
function addCheckboxToCard(card) {
  // Only add if the card doesn't already have a checkbox
  if (card.querySelector('.checkbox-container')) return;
  
  // Create checkbox container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'checkbox-container';
  
  // Create checkbox input
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkbox-custom';
  
  // Extract expense ID from card
  const expenseId = getExpenseIdFromCard(card);
  if (expenseId) {
    checkbox.dataset.id = expenseId;
    card.dataset.id = expenseId; // Also add ID to the card itself
  }
  
  // Add event listener to checkbox to prevent event bubbling
  checkbox.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent card click when checkbox is clicked
    toggleCardSelection(card, this.checked);
  });
  
  // Make the whole card clickable for selection
  card.addEventListener('click', function(e) {
    // Skip if clicked on edit button or checkbox
    if (e.target.closest('.edit-expense-btn') || e.target.closest('.checkbox-container')) {
      return;
    }
    
    // Toggle selection state
    const isSelected = card.classList.contains('selected');
    toggleCardSelection(card, !isSelected);
    
    // Update checkbox state
    const cardCheckbox = card.querySelector('.checkbox-custom');
    if (cardCheckbox) {
      cardCheckbox.checked = !isSelected;
    }
  });
  
  // Append checkbox to container
  checkboxContainer.appendChild(checkbox);
  
  // Add checkbox container to the card
  card.appendChild(checkboxContainer);
}


/**
 * Get expense ID from a card
 * @param {HTMLElement} card - Card element
 * @returns {string|null} - Expense ID or null if not found
 */
function getExpenseIdFromCard(card) {
  // Try to find an action button with a data-id attribute
  const actionButton = card.querySelector('.edit-expense-btn');
  if (actionButton && actionButton.dataset.id) {
    return actionButton.dataset.id;
  }
  return null;
}

/**
 * Toggle card selection state
 * @param {HTMLElement} card - The card element
 * @param {boolean} isSelected - Whether the card should be selected
 */
function toggleCardSelection(card, isSelected) {
  const expenseId = card.dataset.id;
  if (!expenseId) return;
  
  // Toggle selected class
  card.classList.toggle('selected', isSelected);
  
  // Update selected expenses array
  if (isSelected) {
    if (!selectedExpenses.includes(expenseId)) {
      selectedExpenses.push(expenseId);
    }
  } else {
    selectedExpenses = selectedExpenses.filter(id => id !== expenseId);
  }
  
  // Toggle selection mode
  if (selectedExpenses.length > 0 && !selectionActive) {
    activateSelectionMode();
  } else if (selectedExpenses.length === 0 && selectionActive) {
    deactivateSelectionMode();
  }
  
  // Update selection counter
  updateSelectionCounter();
  
  // Update table view selection if it's visible
  updateTableSelectionState();
}

/**
 * Activate selection mode
 */
function activateSelectionMode() {
  selectionActive = true;
  
  // Show all checkboxes
  document.body.classList.add('selection-active');
  
  // Show selection controls
  const selectionControls = document.getElementById('selection-controls');
  if (selectionControls) {
    selectionControls.style.display = 'flex';
  }
  
  // Update card view if it's visible
  updateCardSelectionState();
  
  // Update table view if it's visible
  updateTableSelectionState();
}

/**
 * Deactivate selection mode
 */
function deactivateSelectionMode() {
  selectionActive = false;
  
  // Hide checkboxes
  document.body.classList.remove('selection-active');
  
  // Hide selection controls
  const selectionControls = document.getElementById('selection-controls');
  if (selectionControls) {
    selectionControls.style.display = 'none';
  }
  
  // Uncheck all checkboxes in table view
  const checkboxes = document.querySelectorAll('.checkbox-custom');
  checkboxes.forEach(cb => {
    cb.checked = false;
  });
  
  // Remove selection from all rows
  const rows = document.querySelectorAll('tr.selected');
  rows.forEach(row => {
    row.classList.remove('selected');
  });
  
  // Remove selection from all cards
  const cards = document.querySelectorAll('.expense-card.selected');
  cards.forEach(card => {
    card.classList.remove('selected');
  });
  
  // Clear selected expenses
  selectedExpenses = [];
}

/**
 * Update card selection state when changing views or selection state
 */
function updateCardSelectionState() {
  const cards = document.querySelectorAll('.expense-card');
  
  cards.forEach(card => {
    const expenseId = card.dataset.id;
    if (!expenseId) return;
    
    // Update card selection state
    const isSelected = selectedExpenses.includes(expenseId);
    card.classList.toggle('selected', isSelected);
    
    // Update checkbox state
    const checkbox = card.querySelector('.checkbox-custom');
    if (checkbox) {
      checkbox.checked = isSelected;
    }
  });
}

/**
 * Update table selection state when changing views or selection state
 */
function updateTableSelectionState() {
  const tableRows = document.querySelectorAll('#expenses-table-body tr');
  
  tableRows.forEach(row => {
    const checkbox = row.querySelector('.checkbox-custom');
    if (!checkbox || !checkbox.dataset.id) return;
    
    const expenseId = checkbox.dataset.id;
    
    // Update checkbox state
    checkbox.checked = selectedExpenses.includes(expenseId);
    
    // Update row selection state
    row.classList.toggle('selected', selectedExpenses.includes(expenseId));
  });
}

/**
 * Create selection controls panel
 */
function createSelectionControls() {
  // Check if controls already exist
  if (document.getElementById('selection-controls')) return;
  
  // Create controls container
  const controls = document.createElement('div');
  controls.id = 'selection-controls';
  controls.className = 'selection-controls';
  
  // Create selection counter
  const counter = document.createElement('div');
  counter.id = 'selection-counter';
  counter.className = 'selection-counter';
  counter.textContent = '0 selected';
  
  // Create buttons
  const selectAllBtn = document.createElement('button');
  selectAllBtn.id = 'select-all-btn';
  selectAllBtn.className = 'btn btn-sm btn-secondary';
  selectAllBtn.textContent = 'Select All';
  selectAllBtn.addEventListener('click', selectAllExpenses);
  
  const cancelBtn = document.createElement('button');
  cancelBtn.id = 'cancel-selection-btn';
  cancelBtn.className = 'btn btn-sm btn-secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', deactivateSelectionMode);
  
  const deleteBtn = document.createElement('button');
  deleteBtn.id = 'delete-selected-btn';
  deleteBtn.className = 'btn btn-sm btn-destructive';
  deleteBtn.innerHTML = '<i class="fas fa-trash btn-icon"></i>Delete Selected';
  deleteBtn.addEventListener('click', showDeleteConfirmation);
  
  // Append elements
  controls.appendChild(counter);
  controls.appendChild(selectAllBtn);
  controls.appendChild(cancelBtn);
  controls.appendChild(deleteBtn);
  
  // Append to body
  document.body.appendChild(controls);
}

/**
 * Update selection counter
 */
function updateSelectionCounter() {
  const counter = document.getElementById('selection-counter');
  if (counter) {
    const count = selectedExpenses.length;
    counter.textContent = `${count} selected`;
  }
}

/**
 * Select all expenses
 */
function selectAllExpenses() {
  // For table view
  const tableBody = document.getElementById('expenses-table-body');
  const tableCheckboxes = tableBody ? tableBody.querySelectorAll('.checkbox-custom') : [];
  
  // For card view
  const cardContainer = document.getElementById('card-view-container');
  const cardElements = cardContainer ? cardContainer.querySelectorAll('.expense-card') : [];
  
  // Check if all are already selected (based on either view)
  const allExpenseIds = new Set();
  
  // Collect all IDs from table view
  tableCheckboxes.forEach(checkbox => {
    if (checkbox.dataset.id) {
      allExpenseIds.add(checkbox.dataset.id);
    }
  });
  
  // Collect all IDs from card view
  cardElements.forEach(card => {
    if (card.dataset.id) {
      allExpenseIds.add(card.dataset.id);
    }
  });
  
  // Determine if all are selected
  const allSelected = selectedExpenses.length === allExpenseIds.size && 
                      selectedExpenses.length > 0;
  
  // Clear current selection
  selectedExpenses = [];
  
  // Update table checkboxes
  tableCheckboxes.forEach(checkbox => {
    const row = checkbox.closest('tr');
    
    // Toggle based on current state
    checkbox.checked = !allSelected;
    if (row) row.classList.toggle('selected', !allSelected);
    
    // Update selected expenses array
    if (!allSelected && checkbox.dataset.id) {
      selectedExpenses.push(checkbox.dataset.id);
    }
  });
  
  // Update card selections
  cardElements.forEach(card => {
    // Toggle based on current state
    card.classList.toggle('selected', !allSelected);
    
    // Update checkbox state
    const cardCheckbox = card.querySelector('.checkbox-custom');
    if (cardCheckbox) {
      cardCheckbox.checked = !allSelected;
    }
    
    // Update selected expenses array
    if (!allSelected && card.dataset.id) {
      // Only add if not already in the array (avoid duplicates from table view)
      if (!selectedExpenses.includes(card.dataset.id)) {
        selectedExpenses.push(card.dataset.id);
      }
    }
  });
  
  if (selectedExpenses.length > 0) {
    activateSelectionMode();
  } else {
    deactivateSelectionMode();
  }
  
  updateSelectionCounter();
}

/**
 * Create delete confirmation modal
 */
function createDeleteConfirmationModal() {
  // Check if modal already exists
  if (document.getElementById('delete-confirmation-modal')) return;
  
  // Create modal structure
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'delete-confirmation-modal';
  modalOverlay.className = 'modal-overlay';
  
  modalOverlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-content delete-confirmation-modal">
        <div class="modal-header">
          <h2 class="modal-title">Delete Expenses</h2>
          <button class="modal-close" id="delete-modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <span id="delete-count" class="delete-count">0</span> expenses?</p>
          <p>This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-delete-btn">Cancel</button>
          <button type="button" class="btn btn-destructive" id="confirm-delete-btn">
            <i class="fas fa-trash btn-icon"></i>Delete
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Append to body
  document.body.appendChild(modalOverlay);
  
  // Add event listeners
  document.getElementById('delete-modal-close').addEventListener('click', hideDeleteConfirmation);
  document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteConfirmation);
  document.getElementById('confirm-delete-btn').addEventListener('click', deleteSelectedExpenses);
}

/**
 * Show delete confirmation modal
 */
function showDeleteConfirmation() {
  const modal = document.getElementById('delete-confirmation-modal');
  if (!modal || selectedExpenses.length === 0) return;
  
  // Update count in modal
  const countElement = document.getElementById('delete-count');
  if (countElement) {
    countElement.textContent = selectedExpenses.length;
  }
  
  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

/**
 * Hide delete confirmation modal
 */
function hideDeleteConfirmation() {
  const modal = document.getElementById('delete-confirmation-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

/**
 * Delete selected expenses
 */
function deleteSelectedExpenses() {
  if (selectedExpenses.length === 0) return;
  
  // Convert to numbers for data.js deleteExpense function which expects numbers
  const idsToDelete = selectedExpenses.map(id => parseInt(id));
  
  // Import data module
  import('./data.js').then(dataModule => {
    // Delete each selected expense
    idsToDelete.forEach(id => {
      dataModule.deleteExpense(id);
    });
    
    // Hide confirmation modal
    hideDeleteConfirmation();
    
    // Deactivate selection mode
    deactivateSelectionMode();
    
    // Update UI
    import('./events.js').then(eventsModule => {
      if (eventsModule.updateUIAfterDataChange) {
        eventsModule.updateUIAfterDataChange();
      }
    });
  });
}

/**
 * Observe table changes to add checkboxes to new rows
 */
function observeTableChanges() {
  const tableBody = document.getElementById('expenses-table-body');
  if (!tableBody) return;
  
  // Create a new observer
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      // Check if new nodes were added
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // Check if it's a TR element
          if (node.nodeName === 'TR') {
            // Add checkbox if not already present
            if (!node.querySelector('.checkbox-container')) {
              addCheckboxToRow(node);
            }
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(tableBody, { childList: true });
}

/**
 * Observe card view changes to add checkboxes to new cards
 */
function observeCardViewChanges() {
  const cardContainer = document.getElementById('card-view-container');
  if (!cardContainer) return;
  
  // Create a new observer
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      // Check if new nodes were added
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          // Check if it's a card element
          if (node.classList && node.classList.contains('expense-card')) {
            // Add checkbox if not already present
            if (!node.querySelector('.checkbox-container')) {
              addCheckboxToCard(node);
            }
          }
        });
      }
    });
  });
  
  // Start observing
  observer.observe(cardContainer, { childList: true });
}

/**
 * Listen for view toggle between list and card views
 */
function listenForViewToggle() {
  const listViewBtn = document.getElementById('list-view-btn');
  const cardViewBtn = document.getElementById('card-view-btn');
  
  if (listViewBtn) {
    listViewBtn.addEventListener('click', function() {
      // Short delay to allow DOM to update
      setTimeout(updateTableSelectionState, 100);
    });
  }
  
  if (cardViewBtn) {
    cardViewBtn.addEventListener('click', function() {
      // Short delay to allow DOM to update
      setTimeout(updateCardSelectionState, 100);
    });
  }
}

// Export functions
export {
  initializeSelectionUI,
  addCheckboxesToTable,
  deactivateSelectionMode,
  setupCardViewSelection
};