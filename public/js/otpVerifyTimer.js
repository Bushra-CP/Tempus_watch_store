
document.getElementById("otpForm").addEventListener("submit", function (event) {
  event.preventDefault();

  let valid = true;
  const otpInput = this.otp.value.trim();
  let error = document.getElementById("err");
  if (!otpInput) {
    error.innerHTML = "Please enter OTP";
    valid = false;
  } else {
    error.innerHTML = "";
    valid = true;
  }
  if (valid) {
    this.submit();
  }
});

function validateOtpForm() {}

let inputText = document.getElementById("otp");
let verifyButton = document.getElementById("verify");
let resendButton=document.getElementById('resend');
resendButton.disabled=true;

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
    resendButton.disabled=false;
    inputText.disabled = true;
    verifyButton.disabled = true;
  }
}, 1000);
