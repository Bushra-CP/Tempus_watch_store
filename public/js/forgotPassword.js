document.getElementById("forgotPswd").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = this.email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errorElement = document.getElementById("err1");

  if (!email ||!emailRegex.test(email)) {
    errorElement.textContent = "Enter a valid email";
    return; // Stop submission
  } 

  errorElement.textContent = "";
  this.submit();
});
