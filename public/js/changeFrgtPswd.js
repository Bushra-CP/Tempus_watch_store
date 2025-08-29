document
  .getElementById('changeFrgtPswd')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    let valid = true;

    const pwd = this.password.value;
    const cpwd = this.confirmPassword.value; // Make sure HTML name is confirmPassword

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    // Validate password
    if (!pwd || !pwdRegex.test(pwd)) {
      document.getElementById('err1').innerHTML =
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
      valid = false;
    } else {
      document.getElementById('err1').innerHTML = '';
    }

    // Validate confirm password
    if (!cpwd || pwd !== cpwd) {
      document.getElementById('err2').innerHTML = 'Passwords do not match';
      valid = false;
    } else {
      document.getElementById('err2').innerHTML = '';
    }

    // If all valid, submit the form
    if (valid) {
      this.submit();
    }
  });

  //Clear errors while typing
document.getElementById('password').addEventListener('input', function () {
  document.getElementById('err1').innerHTML = '';
});

document.getElementById('confirmPassword').addEventListener('input', function () {
  document.getElementById('err2').innerHTML = '';
});
