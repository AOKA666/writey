import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { webPageJsonLd } from "@/lib/schema";
import { useSession } from "@/hooks/useSession";

export function RegisterPage() {
  const { registerUser } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    try {
      await registerUser(email, password);
      setOk(true);
      setTimeout(() => navigate("/#editor"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not create this account.");
    }
  }

  return (
    <>
      <Seo
        path="/register"
        jsonLd={webPageJsonLd("/register", "Create account | Writey", [
          { name: "Home", path: "/" },
          { name: "Create account", path: "/register" },
        ])}
      />
      <Header />
      <main id="main" className="page-wrap">
        <div className="desk-well auth-card">
          <h1 className="display-md" style={{ fontSize: 32, lineHeight: "40px" }}>Create account</h1>
          <p className="muted">
            Create an account to keep quota across days and upgrade to Pro. You can still preview and complete a useful Free export without signing in.
          </p>
          {ok ? <p>Account created. You can continue in the editor.</p> : null}
          <form onSubmit={(e) => void onSubmit(e)}>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <div className="btn-row">
              <button type="submit" className="btn btn-primary">Create account</button>
              <Link className="btn btn-secondary" to="/login">Log in</Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
