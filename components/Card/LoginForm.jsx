"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Card.module.scss";
import StoreCardButton from "../StoreProductCard/StoreCardButton";
import Image from "next/image";
import Button from "@/components/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000";
      const res = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Invalid email or password.");
        return;
      }


      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user._id);

      
      router.push("/");

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginFormCard}>
      <div className={styles.loginFormHeader}>
        <Image src="/icon/divyaum logo.png" alt="Login" width={140} height={140} className={styles.loginIcon} />
        <h2 className={styles.loginTitle}>Sign in to your account</h2>
        <p className={styles.loginSubtitle}>Welcome back! Please enter your details.</p>
      </div>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <label className={styles.loginLabel}>
          Email
          <input
            type="email"
            className={styles.loginInput}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoComplete="username"
          />
        </label>
        <label className={styles.loginLabel}>
          Password
          <input
            type="password"
            className={styles.loginInput}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>
        <div className={styles.loginActions}>
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
          <Button
            variant="unstyled"
            type="button"
            className={styles.forgotButton}
            tabIndex={0}
            aria-label="Forgot your password? Click to reset."
            // onClick={() => alert("Forgot password?")}
          >
            <a  href="/forgot-password" className={styles.forgotText}>Forgot password?</a>
          </Button>
        </div>
        {error && <div className={styles.loginError}>{error}</div>}
        <div className={styles.signupPrompt}>
          Don&apos;t have an account?{" "}
          <a href="/signup" className={styles.signupLink}>Sign up</a>
        </div>
      </form>
    </div>
  );
}
