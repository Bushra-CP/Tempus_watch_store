document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action="/admin/add-offer"]');
  const title = form.querySelector('[name="offerTitle"]');
  const discountValue = form.querySelector('[name="discountValue"]');
  const startDate = form.querySelector('[name="startDate"]');
  const endDate = form.querySelector('[name="endDate"]');

  const errTitle = document.getElementById('err_title');
  const errValue = document.getElementById('err_value');
  const errStart = document.getElementById('err_startDate');
  const errEnd = document.getElementById('err_endDate');

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Function to clear error on input
  const clearError = (input, errorField) => {
    input.addEventListener('input', () => {
      errorField.textContent = '';
    });
    input.addEventListener('change', () => {
      errorField.textContent = '';
    });
  };

  // Attach live clear handlers
  clearError(title, errTitle);
  clearError(discountValue, errValue);
  clearError(startDate, errStart);
  clearError(endDate, errEnd);

  // Form submit validation
  form.addEventListener('submit', (e) => {
    let valid = true;

    // Reset errors
    errTitle.textContent = '';
    errValue.textContent = '';
    errStart.textContent = '';
    errEnd.textContent = '';

    // Title validation
    if (!title.value.trim()) {
      errTitle.textContent = 'Offer title is required.';
      errTitle.style.color = 'red';
      valid = false;
    }

    // Discount value validation
    if (!discountValue.value || discountValue.value <= 0) {
      errValue.textContent = 'Discount value must be greater than 0.';
      errValue.style.color = 'red';
      valid = false;
    }

    // Start date validation
    if (!startDate.value) {
      errStart.textContent = 'Start date is required.';
      errStart.style.color = 'red';
      valid = false;
    } else if (startDate.value < today) {
      errStart.textContent = 'Start date cannot be in the past.';
      errStart.style.color = 'red';
      valid = false;
    }

    // End date validation
    if (!endDate.value) {
      errEnd.textContent = 'End date is required.';
      errEnd.style.color = 'red';
      valid = false;
    } else if (endDate.value <= startDate.value) {
      errEnd.textContent = 'End date must be after start date.';
      errEnd.style.color = 'red';
      valid = false;
    }

    if (!valid) e.preventDefault();
  });
});
