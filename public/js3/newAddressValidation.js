const form = document.getElementById('addAddressForm');

form.addEventListener('submit', (e) => {
  e.preventDefault(); // stop default form submission
  let isValid = true;

  // Clear old error messages
  document
    .querySelectorAll("[id^='error-']")
    .forEach((el) => (el.textContent = ''));

  // Get form values
  const country = document.getElementById('country').value.trim();
  const name = document.getElementById('name').value.trim();
  const phoneNo = document.getElementById('phoneNo').value.trim();
  const pincode = document.getElementById('pincode').value.trim();
  const addressLine = document.getElementById('addressLine').value.trim();
  const townCity = document.getElementById('townCity').value.trim();
  const state = document.getElementById('state').value.trim();

  // Country
  if (country.length < 2) {
    document.getElementById('error-country').textContent =
      'Please enter a valid country';
    isValid = false;
  }

  // Name
  if (name.length < 3) {
    document.getElementById('error-name').textContent =
      'Please enter your name';
    isValid = false;
  }

  // Phone Number
  if (!/^[6-9]\d{9}$/.test(phoneNo)) {
    document.getElementById('error-phoneNo').textContent =
      'Enter a valid 10-digit phone number';
    isValid = false;
  }

  // Pincode
  if (!/^\d{6}$/.test(pincode)) {
    document.getElementById('error-pincode').textContent =
      'Enter a valid 6-digit pincode';
    isValid = false;
  }

  // Address Line
  if (addressLine.length < 5) {
    document.getElementById('error-addressLine').textContent =
      'Address must be at least 5 characters';
    isValid = false;
  }

  // Town / City
  if (townCity.length < 2) {
    document.getElementById('error-townCity').textContent =
      'Please enter a valid city';
    isValid = false;
  }

  // State
  if (state.length < 2) {
    document.getElementById('error-state').textContent =
      'Please enter a valid state';
    isValid = false;
  }

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

document
  .getElementById('addAddressForm')
  .addEventListener('reset', function () {
    document
      .querySelectorAll("[id^='error-']")
      .forEach((el) => (el.textContent = ''));
  });



document
  .getElementById('changePasswordForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    let valid = true;


    const currentPwd = this.currentPswd.value;
    const newPwd=this.newPswd.value;
    const cnfrmNewPwd = this.cnfrmNewPswd.value; 

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

if (!currentPwd) {
      document.getElementById('err1').innerHTML =
        'Enter your current password';
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


