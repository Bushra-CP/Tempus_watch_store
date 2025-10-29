function showTable() {
  const value = document.getElementById('listType').value;
  const sections = ['products', 'categories', 'brands'];

  sections.forEach((section) => {
    document.getElementById(section + 'Table').classList.add('hidden');
  });

  document.getElementById(value + 'Table').classList.remove('hidden');
}

let chart;

// Function to load chart data
async function loadChart(filter = 'Monthly') {
  console.log('Loading chart for:', filter); // ✅ check in console

  const response = await fetch(`/admin/dashboard-data?filter=${filter}`);
  const data = await response.json();

  const labels = data.map((item) => item.label);
  const values1 = data.map((item) => item.totalSales);
  const values2 = data.map((item) => item.orderCount);

  // Destroy previous chart before creating new
  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById('revenueChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar', // you can change to 'line' or 'pie'
    data: {
      labels: labels,
      datasets: [
        {
          label: `Sales (${filter})`,
          data: values1,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Orders',
          data: values2,
          backgroundColor: 'rgba(255, 0, 13, 0.6)',
          borderColor: 'rgba(255, 0, 13, 0.6)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 👈 add this line
      scales: { y: { beginAtZero: true } },
    },
  });
}

// Function triggered by dropdown click
function setFilter(filter) {
  loadChart(filter); // dynamically reload data without refreshing page
}

// Load default chart when page loads
loadChart();
