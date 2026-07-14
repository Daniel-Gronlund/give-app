import { useState } from "react";
import { Package, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} {...props}>
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.27a12 12 0 0 0 0 10.75z" />
      <path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.63l4 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

function AppleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" {...props}>
      <path d="M16.53 12.9c-.02-2.1 1.72-3.1 1.8-3.16-.98-1.44-2.5-1.63-3.05-1.65-1.3-.13-2.53.76-3.19.76-.66 0-1.68-.75-2.76-.73-1.42.02-2.73.83-3.46 2.1-1.47 2.56-.38 6.36 1.06 8.44.7 1.02 1.53 2.15 2.63 2.11 1.06-.04 1.46-.68 2.74-.68 1.27 0 1.64.68 2.76.66 1.14-.02 1.86-1.03 2.55-2.06.8-1.18 1.13-2.32 1.15-2.38-.02-.01-2.21-.85-2.23-3.41zM14.6 4.87c.58-.7.97-1.68.86-2.65-.83.03-1.85.55-2.45 1.25-.53.61-1 1.6-.87 2.55.92.07 1.87-.47 2.46-1.15z" />
    </svg>
  );
}

export default function Login() {
  const { signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleProvider(fn) {
    setError("");
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-bg">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-pine">
            <Package size={24} color="#fff" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink">Kvitto</h1>
          <p className="mt-2 text-sm text-inkSoft">
            Låna och hyr ut saker grannar emellan — med en bekräftad överlämning varje gång.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border ${
              mode === "signin" ? "bg-pine text-white border-pine" : "border-line text-inkSoft bg-white"
            }`}
          >
            Logga in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border ${
              mode === "signup" ? "bg-pine text-white border-pine" : "border-line text-inkSoft bg-white"
            }`}
          >
            Ny användare
          </button>
        </div>

        <div className="rounded-2xl p-6 bg-surface border border-line flex flex-col gap-3">
          {mode === "signup" && (
            <p className="text-xs text-inkSoft -mt-1 mb-1">
              Skapa ett konto för att låna ut eller hyra saker av grannar — tar under en minut.
            </p>
          )}
          <button
            onClick={() => handleProvider(signInWithGoogle)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium border border-line bg-white disabled:opacity-50"
          >
            <GoogleIcon /> {mode === "signup" ? "Skapa konto med Google" : "Fortsätt med Google"}
          </button>
          <button
            onClick={() => handleProvider(signInWithApple)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white bg-black disabled:opacity-50"
          >
            <AppleIcon /> {mode === "signup" ? "Skapa konto med Apple" : "Fortsätt med Apple"}
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-inkSoft">eller med e-post</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Namn"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-post"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Lösenord (minst 6 tecken)"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border border-line bg-white"
            />

            {error && (
              <div className="text-xs font-medium px-3 py-2 rounded-lg text-terracotta bg-terracotta/10 border border-terracotta/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-pine disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {mode === "signup" ? "Skapa konto" : "Logga in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email": "Ogiltig e-postadress.",
    "auth/user-not-found": "Ingen användare med den e-postadressen.",
    "auth/wrong-password": "Fel lösenord.",
    "auth/invalid-credential": "Fel e-post eller lösenord.",
    "auth/email-already-in-use": "Det finns redan ett konto med den e-postadressen.",
    "auth/weak-password": "Lösenordet måste vara minst 6 tecken.",
    "auth/popup-closed-by-user": "Inloggningen avbröts.",
    "auth/operation-not-allowed": "Den här inloggningsmetoden är inte aktiverad i Firebase-projektet än.",
  };
  return map[code] || "Något gick fel. Försök igen.";
}
