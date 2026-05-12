import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuthStore } from "../store/auth";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setTokens = useAuthStore((s) => s.setTokens);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.set("username", username);
      form.set("password", password);
      const resp = await axios.post("/api/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setTokens(resp.data.access_token, resp.data.refresh_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-12 p-8 rounded-2xl bg-surface border border-border"
    >
      <h1 className="font-display text-3xl text-text mb-1">Welcome back</h1>
      <p className="text-text-dim mb-6">Sign in to continue your adventure.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Username" value={username} onChange={setUsername} autoFocus />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        {error && <div className="text-danger text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-accent text-bg font-medium shadow-[var(--glow)] hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="mt-6 text-sm text-text-dim text-center">
        New here?{" "}
        <Link to="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-text-dim mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg bg-surface-2 border border-border text-text outline-none focus:border-accent transition"
        required
      />
    </label>
  );
}
