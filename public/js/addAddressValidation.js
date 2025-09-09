document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addAddress');
  if (!form) return; // prevent errors if form is not found

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop default form submission
    let isValid = true;

    // Clear old error messages
    document
      .querySelectorAll("[id^='error-']")
      .forEach((el) => (el.textContent = ''));

    // Get form values
    const country = document.getElementById('country1').value.trim();
    const name = document.getElementById('name1').value.trim();
    const phoneNo = document.getElementById('phoneNo1').value.trim();
    const pincode = document.getElementById('pincode1').value.trim();
    const addressLine = document.getElementById('addressLine1').value.trim();
    const townCity = document.getElementById('townCity1').value.trim();
    const state = document.getElementById('state1').value.trim();

    // Validations
    if (country.length < 2) {
      document.getElementById('error-country').textContent =
        'Please enter a valid country';
      isValid = false;
    }
    document.getElementById('country1').addEventListener('input', function () {
      document.getElementById('error-country').innerHTML = '';
    });

    if (name.length < 3) {
      document.getElementById('error-name').textContent =
        'Please enter your name';
      isValid = false;
    }
    document.getElementById('name1').addEventListener('input', function () {
      document.getElementById('error-name').innerHTML = '';
    });

    if (!/^[6-9]\d{9}$/.test(phoneNo)) {
      document.getElementById('error-phoneNo').textContent =
        'Enter a valid 10-digit phone number';
      isValid = false;
    }
    document.getElementById('phoneNo1').addEventListener('input', function () {
      document.getElementById('error-phoneNo').innerHTML = '';
    });

    if (!/^\d{6}$/.test(pincode)) {
      document.getElementById('error-pincode').textContent =
        'Enter a valid 6-digit pincode';
      isValid = false;
    }
    document.getElementById('pincode1').addEventListener('input', function () {
      document.getElementById('error-pincode').innerHTML = '';
    });

    if (addressLine.length < 5) {
      document.getElementById('error-addressLine').textContent =
        'Address must be at least 5 characters';
      isValid = false;
    }
    document
      .getElementById('addressLine1')
      .addEventListener('input', function () {
        document.getElementById('error-addressLine').innerHTML = '';
      });

    if (townCity.length < 2) {
      document.getElementById('error-townCity').textContent =
        'Please enter a valid city';
      isValid = false;
    }
    document.getElementById('townCity1').addEventListener('input', function () {
      document.getElementById('error-townCity').innerHTML = '';
    });

    if (state.length < 2) {
      document.getElementById('error-state').textContent =
        'Please enter a valid state';
      isValid = false;
    }
    document.getElementById('state1').addEventListener('input', function () {
      document.getElementById('error-state').innerHTML = '';
    });

    // ✅ Submit only if valid
    if (isValid) {
      form.submit();
    }
  });
  // Remove error messages when typing
  document.querySelectorAll('#addAddressForm input').forEach((input) => {
    input.addEventListener('input', () => {
      const errorDiv = document.getElementById('error-' + input.id);
      if (errorDiv) errorDiv.textContent = '';
    });
  });
});



// ============================
// Reset Handler for Add Address Form
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const addressForm = document.getElementById('addAddress');
  if (addressForm) {
    addressForm.addEventListener('reset', () => {
      setTimeout(() => {
        // Clear all error messages
        document.querySelectorAll("[id^='error-']").forEach((el) => {
          el.textContent = '';
        });
      }, 0);
    });
  }
});
