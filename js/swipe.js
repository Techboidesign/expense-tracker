/**
 * swipe.js
 * Handles swipe gestures for mobile devices in the expense tracker
 */

// Configuration for swipe behavior
const swipeConfig = {
    threshold: 80,         // Minimum distance to trigger action (px)
    lockThreshold: 120,    // Distance at which magnetic lock activates (px)
    resistanceFactor: 0.5, // Resistance factor when swiping beyond threshold
    animationDuration: 300 // Animation duration in ms
  };
  
  // Track touch events and state
  let touchState = {
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    activeRow: null,
    swipeDirection: null,
    isLocked: false,
    animating: false
  };
  
  /**
   * Initialize swipe functionality for expense rows
   */
  function initializeSwipeFeatures() {
    // Only initialize on mobile devices
    if (window.innerWidth > 768) return;
    
    // Create event delegate for expense table
    const expensesTable = document.getElementById('expenses-table-body');
    
    if (!expensesTable) {
      console.error('Expenses table body not found');
      return;
    }
    
    console.log('Initializing swipe features for mobile');
    
    // Add event listeners to the table (event delegation)
    expensesTable.addEventListener('touchstart', handleTouchStart, { passive: false });
    expensesTable.addEventListener('touchmove', handleTouchMove, { passive: false });
    expensesTable.addEventListener('touchend', handleTouchEnd, { passive: false });
  }
  
  /**
   * Handle touch start event
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchStart(event) {
    // Only process if it's a table row
    if (!event.target.closest('tr')) return;
    
    // Get the row element
    const row = event.target.closest('tr');
    
    // Skip if this is the empty state row
    if (row.querySelector('.empty-state')) return;
    
    // Reset swipe direction
    touchState.swipeDirection = null;
    touchState.isLocked = false;
    touchState.animating = false;
    
    // Store the starting position
    const touch = event.touches[0];
    touchState.startX = touch.clientX;
    touchState.startY = touch.clientY;
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;
    
    // Store the active row
    touchState.activeRow = row;
    
    // Add a class to indicate the row is being touched
    row.classList.add('row-touching');
    
    // Create or get swipe containers if they don't exist
    ensureSwipeContainers(row);
  }
  
  /**
   * Handle touch move event
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchMove(event) {
    // If no active row or we're animating, don't proceed
    if (!touchState.activeRow || touchState.animating) return;
    
    // Get current touch position
    const touch = event.touches[0];
    touchState.currentX = touch.clientX;
    touchState.currentY = touch.clientY;
    
    // Calculate horizontal and vertical distances
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;
    
    // If vertical scrolling is more significant than horizontal, allow normal scroll
    if (Math.abs(deltaY) > Math.abs(deltaX) && !touchState.swipeDirection) {
      return;
    }
    
    // Prevent default scrolling once we determine it's a horizontal swipe
    event.preventDefault();
    
    // If no swipe direction is set and we've moved enough, set it
    if (!touchState.swipeDirection && Math.abs(deltaX) > 10) {
      touchState.swipeDirection = deltaX > 0 ? 'right' : 'left';
    }
    
    // Apply the transform to the row
    applySwipeTransform(deltaX);
  }
  
  /**
   * Handle touch end event
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchEnd(event) {
    // If no active row, don't proceed
    if (!touchState.activeRow) return;
    
    // Calculate the final distance
    const deltaX = touchState.currentX - touchState.startX;
    
    // Determine whether to snap back or complete the action
    const shouldComplete = Math.abs(deltaX) >= swipeConfig.threshold;
    
    // Determine if we should lock (if beyond lockThreshold)
    const shouldLock = Math.abs(deltaX) >= swipeConfig.lockThreshold;
    
    if (shouldComplete) {
      // Complete the swipe action
      completeSwipeAction(deltaX > 0, shouldLock);
    } else {
      // Reset the row position
      resetRowPosition();
    }
    
    // Remove the touching class
    touchState.activeRow.classList.remove('row-touching');
    touchState.activeRow = null;
  }
  
  /**
   * Ensure the row has the necessary swipe containers
   * @param {HTMLElement} row - The row element
   */
  function ensureSwipeContainers(row) {
    // Check if containers already exist
    if (row.querySelector('.swipe-left-container') && row.querySelector('.swipe-right-container')) {
      return;
    }
    
    // Create swipe right container (checkbox)
    const rightContainer = document.createElement('div');
    rightContainer.className = 'swipe-right-container';
    
    const checkbox = document.createElement('div');
    checkbox.className = 'swipe-checkbox';
    checkbox.innerHTML = '<i class="fas fa-check"></i>';
    checkbox.addEventListener('click', () => handleSwipeCheckbox(row));
    
    rightContainer.appendChild(checkbox);
    
    // Create swipe left container (edit buttons)
    const leftContainer = document.createElement('div');
    leftContainer.className = 'swipe-left-container';
    
    const editButton = document.createElement('div');
    editButton.className = 'swipe-edit-button';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', () => handleSwipeEdit(row));
    
    const deleteButton = document.createElement('div');
    deleteButton.className = 'swipe-delete-button';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', () => handleSwipeDelete(row));
    
    leftContainer.appendChild(editButton);
    leftContainer.appendChild(deleteButton);
    
    // Insert containers into the row
    row.style.position = 'relative';
    row.style.overflow = 'hidden';
    row.appendChild(rightContainer);
    row.appendChild(leftContainer);
  }
  
  /**
   * Apply transform to the row based on swipe distance
   * @param {number} deltaX - Horizontal swipe distance
   */
  function applySwipeTransform(deltaX) {
    if (!touchState.activeRow) return;
    
    let transformX = deltaX;
    
    // Apply resistance after threshold
    if (Math.abs(deltaX) > swipeConfig.threshold) {
      const excess = Math.abs(deltaX) - swipeConfig.threshold;
      const resistedExcess = excess * swipeConfig.resistanceFactor;
      transformX = (deltaX > 0 ? 1 : -1) * (swipeConfig.threshold + resistedExcess);
    }
    
    // Apply transform
    touchState.activeRow.style.transform = `translateX(${transformX}px)`;
    
    // Show appropriate container based on swipe direction
    const row = touchState.activeRow;
    const rightContainer = row.querySelector('.swipe-right-container');
    const leftContainer = row.querySelector('.swipe-left-container');
    
    if (deltaX > 0) {
      // Swiping right, show checkbox
      rightContainer.style.opacity = Math.min(1, Math.abs(deltaX) / swipeConfig.threshold);
      leftContainer.style.opacity = 0;
    } else {
      // Swiping left, show edit/delete
      leftContainer.style.opacity = Math.min(1, Math.abs(deltaX) / swipeConfig.threshold);
      rightContainer.style.opacity = 0;
    }
  }
  
  /**
   * Complete the swipe action
   * @param {boolean} isRightSwipe - Whether it's a right swipe (checkbox)
   * @param {boolean} isLocked - Whether it should stay in locked position
   */
  function completeSwipeAction(isRightSwipe, isLocked) {
    if (!touchState.activeRow) return;
    
    touchState.animating = true;
    touchState.isLocked = isLocked;
    
    const row = touchState.activeRow;
    const targetX = isLocked ? 
      (isRightSwipe ? swipeConfig.lockThreshold : -swipeConfig.lockThreshold) : 0;
    
    // Animate to the target position
    row.style.transition = `transform ${swipeConfig.animationDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
    row.style.transform = `translateX(${targetX}px)`;
    
    // Ensure the appropriate container is visible
    const rightContainer = row.querySelector('.swipe-right-container');
    const leftContainer = row.querySelector('.swipe-left-container');
    
    if (isRightSwipe) {
      rightContainer.style.opacity = isLocked ? 1 : 0;
      leftContainer.style.opacity = 0;
      
      // If locked, add a class to indicate this
      if (isLocked) {
        row.classList.add('swipe-right-locked');
        row.classList.remove('swipe-left-locked');
      }
    } else {
      leftContainer.style.opacity = isLocked ? 1 : 0;
      rightContainer.style.opacity = 0;
      
      // If locked, add a class to indicate this
      if (isLocked) {
        row.classList.add('swipe-left-locked');
        row.classList.remove('swipe-right-locked');
      }
    }
    
    // Clear transition after animation completes
    setTimeout(() => {
      row.style.transition = '';
      touchState.animating = false;
      
      // If not locked, clear transforms
      if (!isLocked) {
        resetRowPosition();
      }
    }, swipeConfig.animationDuration);
  }
  
  /**
   * Reset the row position to normal
   */
  function resetRowPosition() {
    if (!touchState.activeRow) return;
    
    const row = touchState.activeRow;
    
    // Animate back to original position
    row.style.transition = `transform ${swipeConfig.animationDuration}ms ease-out`;
    row.style.transform = 'translateX(0)';
    
    // Hide both containers
    const rightContainer = row.querySelector('.swipe-right-container');
    const leftContainer = row.querySelector('.swipe-left-container');
    
    if (rightContainer) rightContainer.style.opacity = 0;
    if (leftContainer) leftContainer.style.opacity = 0;
    
    // Remove locked classes
    row.classList.remove('swipe-right-locked', 'swipe-left-locked');
    
    // Clear transition after animation completes
    setTimeout(() => {
      row.style.transition = '';
    }, swipeConfig.animationDuration);
  }
  
  /**
   * Handle checkbox action (mark as completed/uncompleted)
   * @param {HTMLElement} row - The row element
   */
  function handleSwipeCheckbox(row) {
    const expenseId = getExpenseIdFromRow(row);
    if (!expenseId) return;
    
    // Toggle a completed class on the row
    row.classList.toggle('expense-completed');
    
    // Add visual feedback
    const checkbox = row.querySelector('.swipe-checkbox');
    checkbox.classList.add('swipe-action-triggered');
    
    setTimeout(() => {
      checkbox.classList.remove('swipe-action-triggered');
      resetRowPosition();
    }, 300);
    
    // TODO: Update the expense status in your data model
    console.log(`Checkbox clicked for expense ID: ${expenseId}`);
    
    // You would add code here to update your expense status
  }
  
  /**
   * Handle edit action
   * @param {HTMLElement} row - The row element
   */
  function handleSwipeEdit(row) {
    const expenseId = getExpenseIdFromRow(row);
    if (!expenseId) return;
    
    // Add visual feedback
    const editButton = row.querySelector('.swipe-edit-button');
    editButton.classList.add('swipe-action-triggered');
    
    setTimeout(() => {
      editButton.classList.remove('swipe-action-triggered');
      resetRowPosition();
    }, 300);
    
    // Open edit modal using your existing function
    console.log(`Edit clicked for expense ID: ${expenseId}`);
    
    // Find and trigger the existing edit button's click handler
    const existingEditBtn = row.querySelector('.edit-expense-btn');
    if (existingEditBtn) {
      existingEditBtn.click();
    }
  }
  
  /**
   * Handle delete action
   * @param {HTMLElement} row - The row element
   */
  function handleSwipeDelete(row) {
    const expenseId = getExpenseIdFromRow(row);
    if (!expenseId) return;
    
    // Add visual feedback
    const deleteButton = row.querySelector('.swipe-delete-button');
    deleteButton.classList.add('swipe-action-triggered');
    
    setTimeout(() => {
      deleteButton.classList.remove('swipe-action-triggered');
    }, 300);
    
    // Call existing delete functionality
    console.log(`Delete clicked for expense ID: ${expenseId}`);
    
    // Find and trigger the existing delete button's click handler
    const existingDeleteBtn = row.querySelector('.delete-expense-btn');
    if (existingDeleteBtn) {
      existingDeleteBtn.click();
    }
  }
  
  /**
   * Get expense ID from a row element
   * @param {HTMLElement} row - The row element
   * @returns {string|null} - The expense ID or null
   */
  function getExpenseIdFromRow(row) {
    // Try to get ID from edit or delete button data attribute
    const actionBtn = row.querySelector('.edit-expense-btn, .delete-expense-btn');
    return actionBtn ? actionBtn.dataset.id : null;
  }
  
  /**
   * Initialize swipe on page load and window resize
   */
  function initSwipeOnResize() {
    // Initialize on load
    initializeSwipeFeatures();
    
    // Re-initialize on window resize
    window.addEventListener('resize', () => {
      // Delay to prevent multiple calls during resize
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer);
      }
      
      window.resizeTimer = setTimeout(() => {
        initializeSwipeFeatures();
      }, 250);
    });
  }
  
  // Export the functions
  export {
    initializeSwipeFeatures,
    initSwipeOnResize,
    resetRowPosition
  };