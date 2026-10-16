"use client";
import { useState } from "react";
import styles from "./AuthModal.module.scss";
import cardStyles from "@/components/Card/Card.module.scss";
import Image from "next/image";
import Button from "@/components/Button";
import { persistAuthFromApiResponse } from "@/components/StoreProductCard/cartApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function SignupModal({ onSwitchToLogin, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    const countryCode = mobile.slice(0, mobile.length - 10);
    const phoneNumber = mobile.slice(-10);
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !mobile) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000";

      const res = await fetch(`${baseUrl}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: phoneNumber,
          countryCode: countryCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Signup failed.");
        return;
      }

      persistAuthFromApiResponse(data);

      window.dispatchEvent(new Event("userUpdated"));

      onClose();

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
          priority
        />
        <h2 className={cardStyles.signupTitle}>Create your account</h2>
        <p className={cardStyles.signupSubtitle}>Join us! Please enter your details.</p>
      </div>

      <form className={cardStyles.signupForm} onSubmit={handleSubmit}>

        {/* Name */}
        <label className={cardStyles.signupLabel}>
          Name
          <input
            type="text"
            className={cardStyles.signupInput}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </label>

        {/* Email */}
        <label className={cardStyles.signupLabel}>
          Email
          <input
            type="email"
            className={cardStyles.signupInput}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>

        {/* Mobile + Country Code */}
        <label className={cardStyles.signupLabel}>
          Mobile Number
          <PhoneInput
            country="in"
            value={mobile}
            onChange={(phone) => setMobile(phone)}
            inputClass={cardStyles.phoneInput}
            containerClass={cardStyles.phoneInputContainer}
            buttonClass={cardStyles.phoneInputButton}
            inputProps={{
              name: "mobile",
              required: true,
              placeholder: "Enter mobile number",
            }}
            inputStyle={{
              width: "100%",
              height: "42px",
              fontSize: "1rem",
            }}
            buttonStyle={{
              border: "none",
              background: "var(--color-surface-solid)",
            }}
            containerStyle={{
              width: "100%",
            }}
          />
        </label>

        {/* Password */}
        <label className={cardStyles.signupLabel}>
          Password
          <input
            type="password"
            className={cardStyles.signupInput}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        {/* Confirm Password */}
        <label className={cardStyles.signupLabel}>
          Confirm Password
          <input
            type="password"
            className={cardStyles.signupInput}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </label>

        <div className={cardStyles.signupActions}>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </div>

        {error && <div className={cardStyles.signupError}>{error}</div>}

        <div className={cardStyles.loginPrompt}>
          Already have an account?{" "}
          <button type="button" className={styles.switchLink} onClick={onSwitchToLogin}>
            Login
          </button>
        </div>

      </form>
    </div>
  );
}