"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Card.module.scss";
import Image from "next/image";
import Button from "@/components/Button";

export default function SignupForm() {
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (!name || !email || !password) {
      setError("Please fill all fields.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,     
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log("Signup Response:", data);

      if (!res.ok) {
        setError(data?.message || "Signup failed.");
        return;
      }

      alert("Signup successful ✅");

     
      router.push("/login");

    } catch (err) {
      console.error("Signup Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupFormCard}>
      <div className={styles.signupFormHeader}>
        <Image
          src="/icon/divyaum logo.png"
          alt="Signup"
          width={140}
          height={140}
          className={styles.signupIcon}
        />
        <h2 className={styles.signupTitle}>Create your account</h2>
        <p className={styles.signupSubtitle}>
          Join us! Please enter your details.
        </p>
      </div>

      <form className={styles.signupForm} onSubmit={handleSubmit}>
        
       
        <label className={styles.signupLabel}>
          Name
          <input
            type="text"
            className={styles.signupInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </label>

        
        <label className={styles.signupLabel}>
          Email
          <input
            type="email"
            className={styles.signupInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>

      
        <label className={styles.signupLabel}>
          Password
          <input
            type="password"
            className={styles.signupInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        <div className={styles.signupActions}>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </div>

        {error && <div className={styles.signupError}>{error}</div>}

        <div className={styles.loginPrompt}>
          Already have an account?{" "}
          <a href="/login" className={styles.loginPromptLink}>
            Login
          </a>
        </div>
      </form>
    </div>
  );
}