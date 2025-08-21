const toastEl = document.getElementById('validationToast');
const toastBody = document.getElementById('toastBody');
const toast = new bootstrap.Toast(toastEl);

document
  .getElementById('signupForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    let valid = true;

    const fName = this.firstName.value.trim();
    const lName = this.lastName.value.trim();
    const email = this.email.value.trim();
    const phone = this.phoneNo.value.trim();
    const pwd = this.password.value;
    const cpwd = this.confirmPassword.value;

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fName.length < 2) {
      document.getElementById('err1').innerHTML = 'Name should be given';
      valid = false;
    } else {
      document.getElementById('err1').innerHTML = '';
      valid = true;
    }

    if (!lName) {
      document.getElementById('err2').innerHTML = 'Last Name should be given';
      valid = false;
    } else {
      document.getElementById('err2').innerHTML = '';
      valid = true;
    }

    if (!email || !emailRegex.test(email)) {
      document.getElementById('err3').innerHTML = 'Enter a valid email';
      valid = false;
    } else {
      document.getElementById('err3').innerHTML = '';
      valid = true;
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      document.getElementById('err4').innerHTML =
        'Phone number must be exactly 10 digits';
      valid = false;
    } else {
      document.getElementById('err4').innerHTML = '';
      valid = true;
    }

    if (!pwd || !pwdRegex.test(pwd)) {
      document.getElementById('err5').innerHTML =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
      valid = false;
    } else {
      document.getElementById('err5').innerHTML = '';
      valid = true;
    }

    if (!cpwd || pwd !== cpwd) {
      document.getElementById('err6').innerHTML = 'Passwords do not match';
      valid = false;
    } else {
      document.getElementById('err6').innerHTML = '';
      valid = true;
    }

    // If all valid, submit the form
    if (valid) {
      this.submit();
    }
  });
