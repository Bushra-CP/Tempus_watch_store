document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let valid = true;

    const email = this.email.value.trim();
    const pwd = this.password.value;

    //const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      document.getElementById("err1").innerHTML = "Enter a valid email";
      valid = false;
    } else {
      document.getElementById("err1").innerHTML = "";
      valid = true;
    }

    if (!pwd) {
      document.getElementById("err2").innerHTML = "Enter password";
      valid = false;
    } else {
      document.getElementById("err2").innerHTML = "";
      valid = true;
    }

    // If all valid, submit the form
    if (valid) {
      this.submit();
    }
  });
