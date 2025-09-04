const form = document.getElementById('addAddressForm');

form.addEventListener('submit', (e) => {
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
  const line1 = document.getElementById('addressLine').value.trim();
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

  // Address Line 1
  if (addressLine.length < 5) {
    document.getElementById('error-line1').textContent =
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

  // ❌ Stop form submission if invalid
  if (isValid) {
    alert('Form is valid! Submitting...');
    this.submit(); // actually submit the form
  }
});
