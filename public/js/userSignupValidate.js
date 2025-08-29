const form = document.getElementById('signupForm');

const fNameInput = form.firstName;
const lNameInput = form.lastName;
const emailInput = form.email;
const phoneInput = form.phoneNo;
const pwdInput = form.password;
const cpwdInput = form.confirmPassword;

const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 👉 Clear error message as user types
function clearErrorOnInput(inputElement, errorElementId) {
  inputElement.addEventListener('input', () => {
    document.getElementById(errorElementId).innerHTML = '';
  });
}

// Attach clear handlers
clearErrorOnInput(fNameInput, 'err1');
clearErrorOnInput(lNameInput, 'err2');
clearErrorOnInput(emailInput, 'err3');
clearErrorOnInput(phoneInput, 'err4');
clearErrorOnInput(pwdInput, 'err5');
clearErrorOnInput(cpwdInput, 'err6');

form.addEventListener('submit', function (event) {
  event.preventDefault();

  let valid = true;

  const fName = fNameInput.value.trim();
  const lName = lNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const pwd = pwdInput.value;
  const cpwd = cpwdInput.value;

  if (fName.length < 2) {
    document.getElementById('err1').innerHTML = 'Name should be given';
    valid = false;
  }

  if (!lName) {
    document.getElementById('err2').innerHTML = 'Last Name should be given';
    valid = false;
  }

  if (!email || !emailRegex.test(email)) {
    document.getElementById('err3').innerHTML = 'Enter a valid email';
    valid = false;
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    document.getElementById('err4').innerHTML =
      'Phone number must be exactly 10 digits';
    valid = false;
  }

  if (!pwd || !pwdRegex.test(pwd)) {
    document.getElementById('err5').innerHTML =
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    valid = false;
  }

  if (!cpwd || pwd !== cpwd) {
    document.getElementById('err6').innerHTML = 'Passwords do not match';
    valid = false;
  }

  // If all valid, submit the form
  if (valid) {
    this.submit();
  }
});
