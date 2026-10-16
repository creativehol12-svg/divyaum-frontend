"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./AuthModal.module.scss";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

import ForgotPasswordModal from "./ForgotPasswordModal";


export default function AuthModal({ isOpen, onClose, defaultView = "login" }) {
  const [view, setView] = useState(defaultView);


  
  useEffect(() => {
    if (isOpen) setView(defaultView);
  }, [isOpen, defaultView]);

  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {view === "login" && (
        <LoginModal
          onSwitchToSignup={() => setView("signup")}
          onSwitchToForgot={() => setView("forgot")}
          onClose={onClose}
        />
      )}
      {view === "signup" && (
        <SignupModal onSwitchToLogin={() => setView("login")} onClose={onClose} />
      )}
      {view === "forgot" && (
        <ForgotPasswordModal onSwitchToLogin={() => setView("login")} onClose={onClose} />
      )}
    </div>,
    document.body,
  );
}