"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AuthModal.module.scss";
import cardStyles from "@/components/Card/Card.module.scss";
import Image from "next/image";
import Button from "@/components/Button";
import { persistAuthFromApiResponse } from "@/components/StoreProductCard/cartApi";
import { getApiBaseUrl } from "@/lib/authApi";
import SocialLoginButtons from "./SocialLoginButtons";

export default function LoginModal({ onSwitchToSignup, onSwitchToForgot, onClose }) {
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
            const res = await fetch(`${getApiBaseUrl()}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data?.message ?? "Invalid email or password.");
                return;
            }

            persistAuthFromApiResponse(data);

            window.dispatchEvent(new Event("userUpdated"));

            onClose();
            router.refresh();

        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cardStyles.loginFormCard}>
            <button className={cardStyles.closeBtn} onClick={onClose}>✕</button>
            <div className={cardStyles.loginFormHeader}>
                <Image
                    src="/icon/divyaum logo.png"
                    alt="Divyaum"
                    width={180}
                    height={56}
                    className={cardStyles.loginIcon}
                    priority
                />
                <h2 className={cardStyles.loginTitle}>Sign in to your account</h2>
                <p className={cardStyles.loginSubtitle}>Welcome back! Please enter your details.</p>
            </div>

            <form className={cardStyles.loginForm} onSubmit={handleSubmit}>
                <label className={cardStyles.loginLabel}>
                    Email
                    <input
                        type="email"
                        className={cardStyles.loginInput}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        autoComplete="username"
                    />
                </label>

                <label className={cardStyles.loginLabel}>
                    Password
                    <input
                        type="password"
                        className={cardStyles.loginInput}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />
                </label>

                <div className={cardStyles.loginActions}>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                    <Button
                        variant="unstyled"
                        type="button"
                        className={cardStyles.forgotButton}
                        onClick={onSwitchToForgot}
                        aria-label="Forgot your password?"
                    >
                        <span className={cardStyles.forgotText}>Forgot password?</span>
                    </Button>
                </div>

                {error && <div className={cardStyles.loginError}>{error}</div>}

                
            </form>

            <SocialLoginButtons onClose={onClose} />
            <div className={cardStyles.signupPrompt}>
                    Don&apos;t have an account?{" "}
                    <button type="button" className={styles.switchLink} onClick={onSwitchToSignup}>
                        Sign up
                    </button>
            </div>
        </div>
    );
}
