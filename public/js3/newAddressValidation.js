document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addAddressForm');

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


////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('editAddressForm');

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent immediate submission

    let isValid = true;

    // Clear previous errors
    form.querySelectorAll('.invalid-feedback').forEach((el) => el.remove());
    form
      .querySelectorAll('.is-invalid')
      .forEach((el) => el.classList.remove('is-invalid'));

    // Field values
    const country = form.country.value.trim();
    const name = form.name.value.trim();
    const phoneNo = form.phoneNo.value.trim();
    const pincode = form.pincode.value.trim();
    const addressLine = form.addressLine.value.trim();
    const townCity = form.townCity.value.trim();
    const state = form.state.value.trim();

    // Regex patterns
    const phonePattern = /^[6-9]\d{9}$/;
    const pinPattern = /^\d{6}$/;
    const textPattern = /^[a-zA-Z\s]+$/;

    // Helper function to show error
    function showError(input, message) {
      input.classList.add('is-invalid');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = message;
      input.parentNode.appendChild(errorDiv);
      isValid = false;
    }

    // Validation checks
    if (!country) showError(form.country, 'Country is required.');

    if (!name) showError(form.name, 'Name is required.');
    else if (!textPattern.test(name))
      showError(form.name, 'Name should contain only letters.');

    if (!phoneNo) showError(form.phoneNo, 'Phone number is required.');
    else if (!phonePattern.test(phoneNo))
      showError(form.phoneNo, 'Enter a valid 10-digit phone number.');

    if (!pincode) showError(form.pincode, 'Pincode is required.');
    else if (!pinPattern.test(pincode))
      showError(form.pincode, 'Pincode must be a 6-digit number.');

    if (!addressLine)
      showError(form.addressLine, 'Address line cannot be empty.');

    if (!townCity) showError(form.townCity, 'Town/City is required.');
    else if (!textPattern.test(townCity))
      showError(form.townCity, 'Town/City should contain only letters.');

    if (!state) showError(form.state, 'State is required.');
    else if (!textPattern.test(state))
      showError(form.state, 'State should contain only letters.');

    // If valid, submit form
    if (isValid) form.submit();
  });

  // Real-time input validation (removes red border as user types)
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const feedback = input.parentNode.querySelector('.invalid-feedback');
      if (feedback) feedback.remove();
    });
  });
});

///////////////////////////////////////////////////////////////////
document
  .getElementById('changePasswordForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    let valid = true;

    const currentPwd = this.currentPswd.value;
    const newPwd = this.newPswd.value;
    const cnfrmNewPwd = this.cnfrmNewPswd.value;

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!currentPwd) {
      document.getElementById('err1').innerHTML = 'Enter your current password';
      valid = false;
    }

    // Validate password
    if (!newPwd || !pwdRegex.test(newPwd)) {
      document.getElementById('err2').innerHTML =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
      valid = false;
    }

    // Validate confirm password
    if (!cnfrmNewPwd || newPwd !== cnfrmNewPwd) {
      document.getElementById('err3').innerHTML = 'Passwords do not match';
      valid = false;
    }

    // If all valid, submit the form
    if (valid) {
      this.submit();
    }
  });

//Clear errors while typing
document.getElementById('currentPswd').addEventListener('input', function () {
  document.getElementById('err1').innerHTML = '';
});

document.getElementById('newPswd').addEventListener('input', function () {
  document.getElementById('err2').innerHTML = '';
});

document.getElementById('cnfrmNewPswd').addEventListener('input', function () {
  document.getElementById('err3').innerHTML = '';
});

// ============================
// Reset Handler for Add Address Form
// ============================
document.addEventListener('DOMContentLoaded', () => {
  const addressForm = document.getElementById('addAddressForm');
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

// ============================
// Reset Handler for Change Password Form
// ============================
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
  changePasswordForm.addEventListener('reset', () => {
    setTimeout(() => {
      document.getElementById('err1').innerHTML = '';
      document.getElementById('err2').innerHTML = '';
      document.getElementById('err3').innerHTML = '';
    }, 0);
  });
}

