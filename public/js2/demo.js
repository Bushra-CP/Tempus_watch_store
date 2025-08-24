/* eslint-disable no-undef */
// Navigation functionality
document.querySelectorAll('.sidebar .nav-link').forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    // Remove active class from all links
    document.querySelectorAll('.sidebar .nav-link').forEach((nav) => {
      nav.classList.remove('active');
    });

    // Add active class to clicked link
    this.classList.add('active');

    // Update page title
    const pageTitle = this.getAttribute('data-page');
    document.getElementById('pageTitle').textContent = pageTitle;
  });
});

// Initialize Chart
const ctx = document.getElementById('revenueChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0d6efd',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          },
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Table row actions
document.querySelectorAll('.table-actions button').forEach((button) => {
  button.addEventListener('click', function () {
    const action = this.textContent;
    const row = this.closest('tr');
    const orderId = row.querySelector('td').textContent;

    if (action === 'View') {
      alert(`Viewing details for order ${orderId}`);
    } else if (action === 'Delete') {
      if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
        row.style.opacity = '0.5';
        setTimeout(() => {
          row.remove();
        }, 300);
      }
    }
  });
});

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement('script');
      d.innerHTML =
        "window.__CF$cv$params={r:'96df4abca15447d7',t:'MTc1NDk5NDU3MC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName('head')[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement('iframe');
    a.height = 1;
    a.width = 1;
    a.style.position = 'absolute';
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = 'none';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    if ('loading' !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener('DOMContentLoaded', c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        'loading' !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();

function setStatus(status) {
  const params = new URLSearchParams(window.location.search); // get current query params
  params.set('status', status); // update or add status
  window.location.search = params.toString(); // reload with updated query string
}

function checkActive(status) {
  const params = new URLSearchParams(window.location.search); // get current query params
  params.set('status', status); // update or add status
  window.location.search = params.toString(); // reload with updated query string
}


