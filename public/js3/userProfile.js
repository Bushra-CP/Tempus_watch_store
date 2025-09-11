function showSection(event, sectionName) {
  // Prevent default only for in-page toggles
  if (sectionName) {
    event.preventDefault();

    // Hide all sections
    const sections = [
      'profile',
      'addresses',
      'wishlist',
      'payments',
      'support',
    ];
    sections.forEach((section) => {
      const el = document.getElementById(section + '-section');
      if (el) el.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) selectedSection.style.display = 'block';

    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach((link) => {
      link.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
  }
}

// Order tracking
document.querySelectorAll('.order-item button').forEach((button) => {
  button.addEventListener('click', function () {
    if (this.textContent === 'Track') {
      alert('Your order is on the way! Expected delivery: Tomorrow');
    } else if (this.textContent === 'View') {
      alert('Order details would open here');
    }
  });
});

// Profile save
document
  .querySelector('#profile-section .btn-primary')
  .addEventListener('click', function () {
    this.textContent = 'Saved!';
    this.classList.add('btn-success');
    setTimeout(() => {
      this.textContent = 'Save Changes';
      this.classList.remove('btn-success');
    }, 2000);
  });

// Wishlist actions
document.querySelectorAll('#wishlist-section button').forEach((button) => {
  button.addEventListener('click', function () {
    if (this.textContent === 'Add to Cart') {
      this.textContent = 'Added!';
      this.classList.add('btn-success');
    } else if (this.textContent === 'Remove') {
      this.closest('.col-md-6').remove();
    }
  });
});

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement('script');
      d.innerHTML =
        "window.__CF$cv$params={r:'9784e16dd66c41c7',t:'MTc1NjczMDg5Mi4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
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
