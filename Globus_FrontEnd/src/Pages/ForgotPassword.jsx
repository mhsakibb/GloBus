import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
  FaShieldAlt,
  FaRedo,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Multi-step: 1 = Email Input, 2 = Enter OTP & New Password, 3 = Success
  const [step, setStep] = useState(1);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI / Status states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Resend Timer (60s cooldown)
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Auto redirect countdown on success
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const otpInputsRef = useRef([]);

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Success auto-redirect effect
  useEffect(() => {
    let timer;
    if (step === 3 && redirectCountdown > 0) {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            navigate("/signin");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, redirectCountdown, navigate]);

  // Handle OTP individual input & auto-focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Take the last character typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Safe API response parser to prevent HTML/SyntaxError leaks
  const safeParseResponse = async (res) => {
    try {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return await res.json();
      }
      const text = await res.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const getCleanErrorMessage = (err, fallback = "Unable to process request. Please try again.") => {
    if (!err) return fallback;
    const msg = typeof err === "string" ? err : err.message || "";
    if (
      msg.includes("<!DOCTYPE") ||
      msg.includes("JSON") ||
      msg.includes("Unexpected token") ||
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("token '<'")
    ) {
      return "Unable to connect to the authentication server. Please try again later.";
    }
    return msg || fallback;
  };

  // Step 1: Request Password Reset Code
  const handleRequestCode = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      return setError("Please enter a valid email address.");
    }

    setLoading(true);
    try {
      const targetUrl = API_URL ? `${API_URL}/forgot-password` : "/forgot-password";
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await safeParseResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "No account found with this email address. Please check your email or sign up.");
      }

      setSuccessMsg(data?.message || "A 6-digit verification code has been sent to your email.");
      setStep(2);
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      setError(getCleanErrorMessage(err, "Failed to send reset code. Please verify your email and try again."));
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendCode = async () => {
    if (!canResend || loading) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const targetUrl = API_URL ? `${API_URL}/forgot-password` : "/forgot-password";
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await safeParseResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to resend verification code.");
      }

      setSuccessMsg("A fresh verification code has been sent to your email!");
      setResendCooldown(60);
      setCanResend(false);
    } catch (err) {
      setError(getCleanErrorMessage(err, "Could not resend verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP and New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullCode = otp.join("").trim();
    if (fullCode.length !== 6) {
      return setError("Please enter the complete 6-digit verification code.");
    }

    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters long.");
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match. Please re-enter.");
    }

    setLoading(true);
    try {
      const targetUrl = API_URL ? `${API_URL}/reset-password` : "/reset-password";
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode,
          newPassword,
        }),
      });

      const data = await safeParseResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "Invalid or expired verification code.");
      }

      setStep(3);
    } catch (err) {
      setError(getCleanErrorMessage(err, "Failed to reset password. Please check your verification code and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 p-3 md:p-6 sm:p-8 transition-all duration-300">
        {/* Brand Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
            {step === 3 ? (
              <FaCheckCircle className="w-7 h-7 text-emerald-500" />
            ) : (
              <FaShieldAlt className="w-7 h-7" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Reset Password"}
            {step === 3 && "Password Reset!"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {step === 1 && "No worries! Enter your email and we'll send you a 6-digit verification code."}
            {step === 2 && (
              <span>
                Enter the code sent to <strong className="text-gray-700 dark:text-gray-200">{email}</strong>
              </span>
            )}
            {step === 3 && "Your password has been successfully reset."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-300 text-xs sm:text-sm font-medium flex items-center gap-2">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && step !== 3 && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium flex items-center gap-2">
            <span className="flex-shrink-0">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <FaEnvelope className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Reset Code</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* 6-Digit OTP Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change Email
                </button>
              </div>

              <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Resend OTP Timer */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Didn't receive code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <FaRedo className="w-3 h-3" />
                    Resend Code
                  </button>
                ) : (
                  <span className="font-medium text-gray-400 dark:text-gray-500">
                    Resend in {resendCooldown}s
                  </span>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <FaLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <FaKey className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Resetting password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center py-3 space-y-5">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-sm">
              Your password has been changed securely. You can now use your new password to sign in.
            </div>

            <button
              onClick={() => navigate("/signin")}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In Now</span>
              <span className="text-xs opacity-75">({redirectCountdown}s)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
