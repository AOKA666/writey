import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { webPageJsonLd } from "@/lib/schema";
import { useSession } from "@/hooks/useSession";

export function LoginPage() {
  const { loginUser } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await loginUser(email, password);
      setOk(true);
      setTimeout(() => navigate("/#editor"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please log in again.");
    }
  }

  return (
    <>
      <Seo
        path="/login"
        jsonLd={webPageJsonLd("/login", "Log in | Writey", [
          { name: "Home", path: "/" },
          { name: "Log in", path: "/login" },
        ])}
      />
      <Header />
      <main id="main" className="page-wrap">
        <div className="desk-well auth-card">
          <h1 className="display-md" style={{ fontSize: 32, lineHeight: "40px" }}>Log in</h1>
          <p className="muted">
            Log in to keep your monthly quota or upgrade to Pro.
          </p>
          {ok ? <p>You’re signed in. Your plan limits now apply to this account.</p> : null}
          <form onSubmit={(e) => void onSubmit(e)}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="btn-row">
              <button type="submit" className="btn btn-primary">Log in</button>
              <Link className="btn btn-secondary" to="/register">Create account</Link>
            </div>
          </form>
          <p className="hint">
            Reset your password. We will send a link to your account email. Provider 【PENDING CONFIRMATION】.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
