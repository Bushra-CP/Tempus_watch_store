document
  .getElementById('loginForm')
  .addEventListener('submit', function (event) {
    event.preventDefault();

    let valid = true;

    const email = this.email.value.trim();
    const pwd = this.password.value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      document.getElementById('err1').innerHTML = 'Enter a valid email';
      valid = false;
    }

    if (!pwd) {
      document.getElementById('err2').innerHTML = 'Enter password';
      valid = false;
    }
    // If all valid, submit the form
    if (valid) {
      this.submit();
    }
  });

//Clear errors while typing
document.getElementById('email').addEventListener('input', function () {
  document.getElementById('err1').innerHTML = '';
});

document.getElementById('password').addEventListener('input', function () {
  document.getElementById('err2').innerHTML = '';
});
