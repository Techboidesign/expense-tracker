/**
 * main.js
 * Entry point for the expense tracker application
 */

import * as data from './data.js';
import * as ui from './ui.js';
import * as charts from './charts.js';
import * as events from './events.js';
import * as selectionUI from './selection-ui.js';

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing application...');

  // Initialize the selection UI
  selectionUI.initializeSelectionUI();
  
  try {
    // Initialize data from localStorage
    data.initializeData();
    
    // Migrate data to new structure if needed
    data.migrateExpensesData();
    
    console.log('Data initialized');
    
    // Initialize UI components
    ui.initializeUI();
    console.log('UI initialized');
    
    // Create charts - check if function exists first
    if (typeof charts.createExpenseChart !== 'function') {
      console.error('Error: charts.createExpenseChart is not a function');
      console.log('Available charts functions:', Object.keys(charts));
    } else {
      charts.createExpenseChart();
      console.log('Charts created');
    }
    
    // Set up event listeners
    if (typeof events.initializeEventListeners !== 'function') {
      console.error('Error: events.initializeEventListeners is not a function');
      console.log('Available events functions:', Object.keys(events));
    } else {
      events.initializeEventListeners();
      console.log('Event listeners initialized');
    }
    
    // Set default date range
    data.setPredefinedDateRange('current-year');
    events.updateUIAfterDataChange();
    
    console.log('Expense Tracker initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    console.log('Error details:', error.stack);
  }
});