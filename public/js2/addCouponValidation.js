document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('couponForm');

  // Reset form handler
  document.getElementById('resetForm').addEventListener('click', () => {
    form.reset();
    clearErrors();
  });

  // Error display helper
  const showError = (id, message) => {
    const errElement = document.getElementById(id);
    if (errElement) {
      errElement.innerText = message;
    }
  };

  const clearErrors = () => {
    document.querySelectorAll("[id^='err-']").forEach((el) => {
      el.innerText = '';
    });
  };

  // Clear error when user focuses the input
  document.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('focus', () => {
      const errElement = document.getElementById('err-' + el.id);
      if (errElement) {
        errElement.innerText = '';
      }
    });
  });

  // Form validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;

    const couponCode = document.getElementById('couponCode').value.trim();
    const discountType = document.getElementById('discountType').value;
    const discountValue = document.getElementById('discountValue').value;
    const validFrom = document.getElementById('validFrom').value;
    const validUntil = document.getElementById('validUntil').value;
    const usageLimit = document.getElementById('usageLimit').value;
    const perUserLimit = document.getElementById('perUserLimit').value;

    // Coupon code validation
    if (!couponCode) {
      showError('err-couponCode', 'Coupon code is required.');
      isValid = false;
    } else if (!/^[A-Za-z0-9]+$/.test(couponCode)) {
      showError('err-couponCode', 'Only letters and numbers allowed.');
      isValid = false;
    }

    // Discount type
    if (!discountType) {
      showError('err-discountType', 'Select a discount type.');
      isValid = false;
    }

    // Discount value
    if (!discountValue || discountValue <= 0) {
      showError('err-discountValue', 'Enter a valid discount value.');
      isValid = false;
    }

    // Dates
    if (!validFrom) {
      showError('err-validFrom', 'Start date is required.');
      isValid = false;
    }
    if (!validUntil) {
      showError('err-validUntil', 'End date is required.');
      isValid = false;
    }
    if (validFrom && validUntil && new Date(validUntil) < new Date(validFrom)) {
      showError('err-validUntil', 'End date must be after start date.');
      isValid = false;
    }

    // Limits
    if (usageLimit && usageLimit < 0) {
      alert('Usage limit cannot be negative.');
      isValid = false;
    }
    if (perUserLimit && perUserLimit < 0) {
      alert('Per user limit cannot be negative.');
      isValid = false;
    }

    if (isValid) {
      console.log('Form data valid ✅');
      form.submit(); // Or handle via AJAX
    }
  });
});
