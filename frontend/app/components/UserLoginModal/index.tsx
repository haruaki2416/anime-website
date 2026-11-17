"use client";
import React, { FormEvent, MouseEventHandler, useState } from "react";
import { motion } from "framer-motion";
import styles from "./component.module.css";
import CloseSvg from "@/public/assets/x.svg";
import { useAuth } from "@/app/lib/auth/AuthProvider";

type Props = { onClick?: MouseEventHandler<HTMLDivElement> };

export default function UserModal({ onClick }: Props) {
  const { login, register, user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    try {
      if (mode === "signup") {
        const username = String(values.get("username") || "").trim();
        if (password !== String(values.get("confirm_password") || "")) throw new Error("Passwords do not match.");
        await register(email, username, password);
      } else {
        await login(email, password);
      }
      onClick?.({} as React.MouseEvent<HTMLDivElement>);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (user) return null;

  return (
    <motion.div id={styles.backdrop} onClick={onClick} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div id={styles.modal} onClick={(e) => e.stopPropagation()} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div id={styles.heading}>
          <h5>{mode === "login" ? "Log in to AniProject" : "Create your account"}</h5>
          <button type="button" aria-label="Close" onClick={onClick as MouseEventHandler<HTMLButtonElement>}><CloseSvg width={16} height={16} /></button>
        </div>
        <p className={styles.loggin_advice}>Your account and library are stored securely on Railway.</p>
        <form onSubmit={submit} data-error-occurred={!!error}>
          {mode === "signup" && <label>Username<input name="username" minLength={1} maxLength={15} required placeholder="Your username" /></label>}
          <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
          <label>Password<input name="password" type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} required placeholder="At least 8 characters, with a number" /></label>
          {mode === "signup" && <label>Confirm password<input name="confirm_password" type="password" minLength={8} required autoComplete="new-password" placeholder="Enter your password again" /></label>}
          {error && <p role="alert" style={{ color: "#c33" }}>{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
        </form>
        <button id={styles.create_account_button} type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
          {mode === "login" ? "Create an account" : "Already have an account? Log in"}
        </button>
      </motion.div>
    </motion.div>
  );
}
