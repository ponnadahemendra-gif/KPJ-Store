const AUTH_KEY = "wrognAuthUser";
const OTP_KEY = "wrognAuthOtp";

const methodButtons = document.querySelectorAll(".method-btn");
const authInput = document.getElementById("authInput");
const inputLabel = document.getElementById("inputLabel");
const sendOtpButton = document.getElementById("sendOtpButton");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");
const verifyOtpButton = document.getElementById("verifyOtpButton");
const otpStatus = document.getElementById("otpStatus");

let selectedMethod = "phone";

function setMethod(method) {
  selectedMethod = method;
  methodButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.method === method);
  });

  if (method === "phone") {
    inputLabel.textContent = "Phone number";
    authInput.placeholder = "Enter your phone number";
    authInput.type = "text";
  } else {
    inputLabel.textContent = "Email address";
    authInput.placeholder = "Enter your email address";
    authInput.type = "email";
  }

  otpSection.classList.add("hidden");
  otpStatus.textContent = "";
  otpInput.value = "";
}

function validateInput(value) {
  if (selectedMethod === "phone") {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length >= 10;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getCleanedInput(value) {
  return selectedMethod === "phone" ? value.replace(/\D/g, "") : value.trim().toLowerCase();
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOtp() {
  const rawValue = authInput.value.trim();
  if (!validateInput(rawValue)) {
    otpStatus.textContent = selectedMethod === "phone" ? "Enter a valid phone number." : "Enter a valid email address.";
    otpStatus.style.color = "#ff6b6b";
    return;
  }

  const destination = getCleanedInput(rawValue);
  const otpCode = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  localStorage.setItem(OTP_KEY, JSON.stringify({ code: otpCode, destination, method: selectedMethod, expiresAt }));
  otpSection.classList.remove("hidden");
  otpStatus.textContent = "OTP sent successfully. Enter it below to continue.";
  otpStatus.style.color = "#a9ff9f";

  console.info(`OTP for ${destination}: ${otpCode}`);
}

function verifyOtp() {
  const stored = localStorage.getItem(OTP_KEY);
  const rawOtp = otpInput.value.trim();
  if (!stored) {
    otpStatus.textContent = "No OTP request found. Please send OTP again.";
    otpStatus.style.color = "#ff6b6b";
    return;
  }

  const { code, destination, method, expiresAt } = JSON.parse(stored);
  const enteredOtp = rawOtp;
  const destinationInput = getCleanedInput(authInput.value.trim());

  if (Date.now() > expiresAt) {
    otpStatus.textContent = "OTP expired. Please request a new one.";
    otpStatus.style.color = "#ff6b6b";
    return;
  }

  if (enteredOtp !== code || destinationInput !== destination || method !== selectedMethod) {
    otpStatus.textContent = "Invalid OTP or input does not match. Please try again.";
    otpStatus.style.color = "#ff6b6b";
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify({ method, destination, verifiedAt: new Date().toISOString() }));
  otpStatus.textContent = "Verified successfully. Redirecting to the shop...";
  otpStatus.style.color = "#a9ff9f";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

methodButtons.forEach((button) => {
  button.addEventListener("click", () => setMethod(button.dataset.method));
});

sendOtpButton.addEventListener("click", sendOtp);
verifyOtpButton.addEventListener("click", verifyOtp);

setMethod(selectedMethod);
