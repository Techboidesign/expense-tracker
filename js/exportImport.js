/**
 * exportImport.js
 * Handles import and export functionality for expense data
 */

import { closeImportModal } from './modals.js';

// Variable to store imported data temporarily
let importedData = null;

/**
 * Export expenses to JSON file
 */
function exportToJson() {
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  const dataStr = JSON.stringify(expenses, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expense_tracker_data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Handle file selection for import
 * @param {Event} event - File input change event
 * @param {Function} previewCallback - Callback to show preview
 */
function handleFileSelection(event, previewCallback) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (Array.isArray(data)) {
        importedData = data;
        if (previewCallback) {
          previewCallback(data);
        }
      } else {
        alert('Invalid data format. Please import a valid expense data file.');
      }
    } catch (error) {
      alert('Error reading file: ' + error.message);
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input value to allow re-importing the same file
  event.target.value = '';
}

/**
 * Generate import preview HTML
 * @param {Array} data - Imported expense data
 */
function showImportPreview(data) {
  const previewElement = document.getElementById('import-preview');
  previewElement.innerHTML = '';
  
  if (!data || data.length === 0) {
    previewElement.innerHTML = '<p>No expenses found in the imported file.</p>';
    return;
  }
  
  const previewList = document.createElement('ul');
  previewList.style.listStyle = 'none';
  previewList.style.padding = '0';
  
  const maxPreview = Math.min(data.length, 5);
  for (let i = 0; i < maxPreview; i++) {
    const exp = data[i];
    const item = document.createElement('li');
    item.style.padding = '0.25rem 0';
    item.style.borderBottom = i < maxPreview - 1 ? '1px solid var(--border)' : 'none';
    
    // Update to use the recurrence property directly
    item.innerHTML = `
      <strong>${exp.name}</strong> - 
      ${exp.category} - 
      $${exp.amount.toFixed(2)} - 
      ${exp.recurrence || 'N/A'}
    `;
    
    previewList.appendChild(item);
  }
  
  const countMsg = document.createElement('p');
  countMsg.style.marginTop = '0.5rem';
  countMsg.style.fontStyle = 'italic';
  countMsg.textContent = `Total: ${data.length} expense${data.length !== 1 ? 's' : ''}`;
  
  previewElement.appendChild(previewList);
  previewElement.appendChild(countMsg);
}

/**
 * Confirm and apply the import
 */
function confirmImport() {
  if (!importedData || !Array.isArray(importedData)) {
    alert('Invalid data. Import cancelled.');
    closeImportModal();
    return;
  }
  
  // Validate each expense item and migrate to new structure if needed
  const validData = importedData.map(exp => {
    // Create a copy of the expense to avoid modifying the original
    const newExp = { ...exp };
    
    // If it has the old structure, migrate it
    if (newExp.hasOwnProperty('expenseType') && !newExp.hasOwnProperty('recurrence')) {
      if (newExp.expenseType === 'Recurring') {
        newExp.recurrence = newExp.recurrence || 'Monthly';
      } else {
        newExp.recurrence = 'One-time';
      }
      
      // Remove old properties
      delete newExp.expenseType;
    }
    
    return newExp;
  }).filter(exp => 
    exp && 
    typeof exp === 'object' && 
    typeof exp.name === 'string' && 
    typeof exp.category === 'string' && 
    typeof exp.amount === 'number' &&
    typeof exp.recurrence === 'string'
  );
  
  // Save directly to localStorage
  localStorage.setItem('expenses', JSON.stringify(validData));
  
  // Notify user and reload the page
  alert(`Successfully imported ${validData.length} expense${validData.length !== 1 ? 's' : ''}. The page will now reload.`);
  closeImportModal();
  setTimeout(() => window.location.reload(), 500);
}

/**
 * Download expenses as Excel
 */
function downloadAsExcel() {
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  
  // Create a workbook with a worksheet
  const wb = XLSX.utils.book_new();
  
  // Convert expenses to worksheet format using updated recurrence model
  const data = [
    ["Name", "Category", "Recurrence", "Amount", "Due Date", "Notes"] // Updated headers
  ];
  
  expenses.forEach(exp => {
    const dueDate = exp.dueDate ? new Date(exp.dueDate).toLocaleDateString() : 'N/A';
    data.push([
      exp.name,
      exp.category,
      exp.recurrence, // Use recurrence directly
      exp.amount.toFixed(2),
      dueDate,
      exp.notes || ''
    ]);
  });
  
  // Add summary data
  const totalMonthly = document.getElementById('total-monthly').textContent;
  const totalYearly = document.getElementById('total-yearly').textContent;
  
  data.push([]);
  data.push(["Total Monthly", "", "", totalMonthly, "", ""]);
  data.push(["Total Yearly", "", "", totalYearly, "", ""]);
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  
  // Write and download
  XLSX.writeFile(wb, "expense_tracker.xlsx");
}

/**
 * Print expense data as PDF
 */
function printAsPDF() {
  // Apply print class to body for print styling
  document.body.classList.add('print-mode');
  
  // Print the page
  window.print();
  
  // Short timeout to remove the class after print dialog appears
  setTimeout(() => {
    document.body.classList.remove('print-mode');
  }, 500);
}

// Export functions and data
export {
  importedData,
  exportToJson,
  handleFileSelection,
  showImportPreview,
  confirmImport,
  downloadAsExcel,
  printAsPDF
};