/**
 * charts.js
 * Handles chart creation and updates using Chart.js
 */

import * as data from './data.js';
import { getCategoryColor } from './utils.js';

// Chart instance
let expenseChart = null;

/**
 * Initialize the expense chart
 */
function createExpenseChart() {
  const ctx = document.getElementById('expense-chart').getContext('2d');
  
  // Get data for chart
  const { categorySums } = data.getCategorySums();
  
  // Extract labels and data
  const labels = Object.keys(categorySums);
  const values = Object.values(categorySums);
  
  // Generate colors based on category
  const colors = labels.map(label => getCategoryColor(label));
  
  // Create chart
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: 'Expenses by Category',
          align: 'start',
          position: 'top',
          font: {
            family: "'Space Grotesk', sans-serif",
            size: 12,
            weight: '500'
          },
          color: 'rgb(15, 23, 42)', // var(--primary)
          padding: {
            top: 4,
            left: 16,
            right: 16,
            bottom: 10
          },
          backgroundColor: 'rgb(241, 245, 249)', // var(--accent)
          borderRadius: 4
        },
        tooltip: {
          titleFont: {
            family: "'Space Grotesk', sans-serif",
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: "'Space Grotesk', sans-serif",
            size: 13
          },
          callbacks: {
            title: function(tooltipItems) {
              // Return an empty string - we'll show the title in the label
              return '';
            },
            label: function(context) {
              const value = context.raw || 0;
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              
              // Use strong text for the uppercase category name without the dot
              return `${context.label.toUpperCase()}: $${value.toFixed(2)} (${percentage}%)`;
            },
            labelTextColor: function(context) {
              // Return white for the text color
              return 'white';
            }
          },
          titleMarginBottom: 0,
          displayColors: true, // This will show the color box before the label
          boxWidth: 10,        // Width of the color box
          boxHeight: 10,       // Height of the color box
          usePointStyle: true, // Make the color box a circle
          bodyFont: {
            family: "'Space Grotesk', sans-serif",
            size: 13,
            weight: 'bold'     // Make all text in the body bold
          }
        }
      }
    }
  });
}

/**
 * Update chart data based on current filters
 */
function updateCharts() {
  if (!expenseChart) return;
  
  // Get data based on current filters
  const { categorySums } = data.getCategorySums();
  
  // Extract labels and data
  const labels = Object.keys(categorySums);
  const values = Object.values(categorySums);
  
  // Generate colors based on category
  const colors = labels.map(label => getCategoryColor(label));
  
  // Update chart
  expenseChart.data.labels = labels;
  expenseChart.data.datasets[0].data = values;
  expenseChart.data.datasets[0].backgroundColor = colors;
  expenseChart.update();
}

export {
  createExpenseChart,
  updateCharts
};