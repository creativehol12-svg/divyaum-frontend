"use client";
import { useState } from "react";
import styles from "./AuthModal.module.scss";
import cardStyles from "@/components/Card/Card.module.scss";
import Image from "next/image";
import Button from "@/components/Button";

export default function ForgotPasswordModal({ onSwitchToLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleVerifyEmail = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError("");
    setVerifyLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000";
      const res = await fetch(`${baseUrl}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Email not found. Please try again.");
        return;
      }

      setOtpSent(true);
      setSuccess("OTP sent to your email!");

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      setError("Please fill all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000";
      const res = await fetch(`${baseUrl}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Reset failed. Please try again.");
        return;
      }

      setSuccess("Password reset successful!");
      
      setTimeout(() => onSwitchToLogin(), 2000);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cardStyles.signupFormCard}>
       <button className={cardStyles.closeBtn} onClick={onClose}>
          ✕
      </button>
      <div className={cardStyles.signupFormHeader}>
        <Image
          src="/icon/divyaum logo.png"
          alt="Divyaum"
          width={180}
          height={56}
          className={cardStyles.signupIcon}
        />
        <h2 className={cardStyles.signupTitle}>Forgot Password</h2>
        <p className={cardStyles.signupSubtitle}>Enter your email to reset your password.</p>
      </div>

      <form className={cardStyles.signupForm} onSubmit={handleSubmit}>
        {/* Email + Verify Button */}
        <label className={cardStyles.signupLabel}>
          Email
          <div className={cardStyles.emailRow}>
            <input
              type="email"
              className={cardStyles.signupInput}
              value={email}
              onChange={e => { setEmail(e.target.value); setOtpSent(false); setSuccess(""); }}
              required
              placeholder="Enter your email"
              autoComplete="email"
              disabled={verifyLoading || otpSent}
            />
            <button
              type="button"
              className={cardStyles.verifyBtn}
              onClick={handleVerifyEmail}
              disabled={verifyLoading || otpSent}
            >
              {verifyLoading ? "Sending..." : otpSent ? "Sent ✓" : "Verify"}
            </button>
          </div>
        </label>

        {/* OTP */}
        <label className={cardStyles.signupLabel}>
          OTP
          <input
            type="text"
            className={cardStyles.signupInput}
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            placeholder="Enter OTP"
            maxLength={6}
            disabled={!otpSent}
          />
        </label>

        {/* New Password */}
        <label className={cardStyles.signupLabel}>
          New Password
          <input
            type="password"
            className={cardStyles.signupInput}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
            autoComplete="new-password"
            disabled={!otpSent}
          />
        </label>

        <div className={cardStyles.signupActions}>
          <Button type="submit" disabled={loading || !otpSent}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>

        {error && <div className={cardStyles.signupError}>{error}</div>}
        {success && <div className={cardStyles.signupSuccess}>{success}</div>}

        <div className={cardStyles.loginPrompt}>
          Remember your password?{" "}
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}