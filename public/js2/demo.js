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

///USER MANAGEMENT///
async function blockUser(event, name, url) {
  event.preventDefault(); // stop link from navigating immediately

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you really want to block ${name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, block',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    // proceed to the link after confirmation
    window.location.href = url;
  }
}

async function unblockUser(event, name, url) {
  event.preventDefault(); // stop link from navigating immediately

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you really want to unblock ${name}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, unblock',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    // proceed to the link after confirmation
    window.location.href = url;
  }
}

////CATEGORY MANAGEMENT////
async function deactivateCategory(event, categoryName, url) {
  event.preventDefault(); // stop link from navigating immediately

  const result = await Swal.fire({
    title: 'Confirm Deactivation',
    text: `Do you really want to deactivate "${categoryName}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, deactivate',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    window.location.href = url; // proceed only after confirmation
  }
}

async function activateCategory(event, categoryName, url) {
  event.preventDefault(); // stop link from navigating immediately

  const result = await Swal.fire({
    title: 'Confirm Activation',
    text: `Do you really want to activate "${categoryName}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, activate',
    cancelButtonText: 'No, cancel',
  });

  if (result.isConfirmed) {
    window.location.href = url; // proceed only after confirmation
  }
}
