function validateOtpForm() {
  let otpInput = document.getElementById("verify").value;
  let error = document.getElementById("err");
  if (!otpInput) {
    error.innerHTML = "Please enter OTP";
  }
}

let inputText = document.getElementById("confirmPassword");
let verifyButton = document.getElementById("verify");
let timeleft = 120;
let timerElement = document.getElementById("timer");
const timer = setInterval(() => {
  let minutes = Math.floor(timeleft / 60);
  let seconds = timeleft % 60;
  timerElement.textContent = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
  timeleft--;
  if (timeleft < 0) {
    clearInterval(timer);
    timerElement.textContent = "00:00";
    inputText.disabled = true;
    verifyButton.disabled = true;
  }
}, 1000);
