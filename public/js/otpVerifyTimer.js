document.getElementById('otpForm').addEventListener('submit', function (event) {
  event.preventDefault();

  let valid = true;
  const otpInput = this.otp.value.trim();
  let error = document.getElementById('err');
  if (!otpInput) {
    error.innerHTML = 'Please enter OTP';
    valid = false;
  } else {
    error.innerHTML = '';
    valid = true;
  }
  if (valid) {
    this.submit();
  }
});

//Clear errors while typing
document.getElementById('otp').addEventListener('input', function () {
  document.getElementById('err').innerHTML = '';
});

function validateOtpForm() {}

let inputText = document.getElementById('otp');
let verifyButton = document.getElementById('verify');
let resendButton = document.getElementById('resend');
let timerElement = document.getElementById('timer');
resendButton.disabled = true;

// If endTime is not already stored, set it
if (!localStorage.getItem('otpEndTime')) {
  let endTime = Date.now() + 60 * 1000; // 60 seconds from now
  localStorage.setItem('otpEndTime', endTime);
}

function startTimer() {
  const endTime = parseInt(localStorage.getItem('otpEndTime'));

  const timer = setInterval(() => {
    let now = Date.now();
    let timeleft = Math.floor((endTime - now) / 1000);

    if (timeleft >= 0) {
      let minutes = Math.floor(timeleft / 60);
      let seconds = timeleft % 60;
      timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      clearInterval(timer);
      timerElement.textContent = '00:00';
      resendButton.disabled = false;
      inputText.disabled = true;
      verifyButton.disabled = true;
      localStorage.removeItem('otpEndTime'); // clear for next OTP
    }
  }, 1000);
}

startTimer();
