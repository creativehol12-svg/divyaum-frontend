"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Card.module.scss";
import Image from "next/image";
import Button from "@/components/Button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const router = useRouter();

  
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

      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupFormCard}>
      <div className={styles.signupFormHeader}>
        <Image src="/icon/divyaum logo.png" alt="Forgot Password" width={140} height={140} className={styles.signupIcon} />
        <h2 className={styles.signupTitle}>Forgot Password</h2>
        <p className={styles.signupSubtitle}>Enter your email to reset your password.</p>
      </div>

      <form className={styles.signupForm} onSubmit={handleSubmit}>

        {/* Email + Verify Button */}
        <label className={styles.signupLabel}>
          Email
          <div className={styles.emailRow}>
            <input
              type="email"
              className={styles.signupInput}
              value={email}
              onChange={e => { setEmail(e.target.value); setOtpSent(false); setSuccess(""); }}
              required
              placeholder="Enter your email"
              autoComplete="email"
              disabled={verifyLoading || otpSent}
            />
            <button
              type="button"
              className={styles.verifyBtn}
              onClick={handleVerifyEmail}
              disabled={verifyLoading || otpSent}
            >
              {verifyLoading ? "Sending..." : otpSent ? "Sent ✓" : "Verify"}
            </button>
          </div>
        </label>

        {/* OTP */}
        <label className={styles.signupLabel}>
          OTP
          <input
            type="text"
            className={styles.signupInput}
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            placeholder="Enter OTP"
            maxLength={6}
            disabled={!otpSent}
          />
        </label>

        {/* New Password */}
        <label className={styles.signupLabel}>
          New Password
          <input
            type="password"
            className={styles.signupInput}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
            autoComplete="new-password"
            disabled={!otpSent}
          />
        </label>

        <div className={styles.signupActions}>
          <Button type="submit" disabled={loading || !otpSent}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>

        {error && <div className={styles.signupError}>{error}</div>}
        {success && <div className={styles.signupSuccess}>{success}</div>}

        <div className={styles.loginPrompt}>
          Remember your password?{" "}
          <a href="/login" className={styles.loginPromptLink}>Login</a>
        </div>
      </form>
    </div>
  );
}