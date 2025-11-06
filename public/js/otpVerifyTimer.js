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

let timer; // store interval reference

function setNewTimer() {
  let endTime = Date.now() + 60 * 1000;
  sessionStorage.setItem('otpEndTime', endTime);
  resendButton.disabled = true;
  inputText.disabled = false;
  verifyButton.disabled = false;
  startTimer();
}

function updateTimer() {
  const endTime = parseInt(sessionStorage.getItem('otpEndTime'));
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
    sessionStorage.removeItem('otpEndTime');
  }
}

function startTimer() {
  clearInterval(timer);
  updateTimer();
  timer = setInterval(updateTimer, 1000);
}

// ✅ Detect if it's a new OTP (from query param)
const urlParams = new URLSearchParams(window.location.search);
const isNewOtp = urlParams.get('new');

// ✅ Remove "?new=true" from the address bar after reading
if (isNewOtp) {
  window.history.replaceState({}, document.title, window.location.pathname);
}

if (isNewOtp === 'true' || !sessionStorage.getItem('otpEndTime')) {
  setNewTimer(); // start new 60s timer
} else {
  startTimer(); // continue existing countdown
}

// // ✅ When user clicks Verify
// verifyButton.addEventListener('click', () => {
//   clearInterval(timer); // stop the timer immediately
//   localStorage.removeItem('otpEndTime'); // clear the saved timer
//   console.log('Timer cleared after verify');
// });
