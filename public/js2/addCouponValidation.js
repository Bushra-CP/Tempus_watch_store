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
    const minPurchaseAmount =
      document.getElementById('minPurchaseAmount').value;
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

    //minimum purchase amount
    if (!minPurchaseAmount || minPurchaseAmount <= 0) {
      showError(
        'err-minPurchaseAmount',
        'Enter a valid minimum purchase value.',
      );
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

////////////EDIT COUPON VALIDATION///////////////////
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('editCouponForm');
  const resetBtn = document.getElementById('resetForm');

  // 🔹 Function to show error message
  function showError(input, message) {
    let existingError = input.parentNode.querySelector('.invalid-feedback');
    if (!existingError) {
      existingError = document.createElement('div');
      existingError.classList.add('invalid-feedback', 'd-block');
      input.parentNode.appendChild(existingError);
    }
    existingError.textContent = message;
    input.classList.add('is-invalid');
  }

  // 🔹 Function to remove error when typing or changing
  function clearErrorOnInput(input) {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const error = input.parentNode.querySelector('.invalid-feedback');
      if (error) error.remove();
    });

    // For dropdowns or number inputs that don’t trigger ‘input’ sometimes
    input.addEventListener('change', () => {
      input.classList.remove('is-invalid');
      const error = input.parentNode.querySelector('.invalid-feedback');
      if (error) error.remove();
    });
  }

  // 🔹 Function to clear all errors (for reset)
  function clearAllErrors() {
    form.querySelectorAll('.invalid-feedback').forEach((el) => el.remove());
    form
      .querySelectorAll('.is-invalid')
      .forEach((el) => el.classList.remove('is-invalid'));
  }

  // Attach live error clearing to all inputs
  form
    .querySelectorAll('input, select, textarea')
    .forEach((field) => clearErrorOnInput(field));

  // 🔹 Validate on submit
  form.addEventListener('submit', function (e) {
    clearAllErrors();
    let valid = true;

    const couponCode = form.querySelector('#couponCode');
    const discountType = form.querySelector("select[name='discountType']");
    const discountValue = form.querySelector('#discountValue');
    const minPurchaseAmount = form.querySelector('#minPurchaseAmount');
    const maxDiscountAmount = form.querySelector('#maxDiscountAmount');
    const usageLimit = form.querySelector('#usageLimit');
    const perUserLimit = form.querySelector('#perUserLimit');
    const validFrom = form.querySelector('#validFrom');
    const validUntil = form.querySelector('#validUntil');

    // 1️⃣ Coupon Code
    if (!couponCode.value.trim()) {
      showError(couponCode, 'Coupon code is required.');
      valid = false;
    } else if (!/^[A-Za-z0-9 ]+$/.test(couponCode.value.trim())) {
      showError(couponCode, 'Only letters and numbers are allowed.');
      valid = false;
    }

    // 2️⃣ Discount Type
    if (!discountType.value.trim()) {
      showError(discountType, 'Please select a discount type.');
      valid = false;
    }

    // 3️⃣ Discount Value
    if (!discountValue.value || Number(discountValue.value) <= 0) {
      showError(discountValue, 'Enter a discount value greater than 0.');
      valid = false;
    }

    // 4️⃣ Minimum & Maximum values
    if (minPurchaseAmount.value && Number(minPurchaseAmount.value) < 0) {
      showError(minPurchaseAmount, 'Minimum order cannot be negative.');
      valid = false;
    }

    if (maxDiscountAmount.value && Number(maxDiscountAmount.value) < 0) {
      showError(maxDiscountAmount, 'Maximum discount cannot be negative.');
      valid = false;
    }

    // 5️⃣ Usage limits
    if (usageLimit.value && Number(usageLimit.value) <= 0) {
      showError(usageLimit, 'Usage limit must be greater than 0.');
      valid = false;
    }

    if (perUserLimit.value && Number(perUserLimit.value) <= 0) {
      showError(perUserLimit, 'Per-user limit must be greater than 0.');
      valid = false;
    }

    // 6️⃣ Date validation
    const startDate = new Date(validFrom.value);
    const endDate = new Date(validUntil.value);

    if (!validFrom.value.trim()) {
      showError(validFrom, 'Start date is required.');
      valid = false;
    }

    if (!validUntil.value.trim()) {
      showError(validUntil, 'End date is required.');
      valid = false;
    } else if (startDate && endDate && startDate >= endDate) {
      showError(validUntil, 'End date must be after start date.');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // 🔹 Reset button clears form and errors
  resetBtn.addEventListener('click', function () {
    form.reset();
    clearAllErrors();
  });
});
