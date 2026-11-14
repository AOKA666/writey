import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { SessionProvider } from "@/hooks/useSession";
import { FaqPage } from "@/pages/FaqPage";
import { HindiPage } from "@/pages/HindiPage";
import { HomePage } from "@/pages/HomePage";
import { LegalPage } from "@/pages/LegalPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PricingPage } from "@/pages/PricingPage";
import { RegisterPage } from "@/pages/RegisterPage";

function ScrollToHash() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash.startsWith("#editor")) {
      const el = document.getElementById("editor");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.pathname, location.hash]);
  return null;
}

export function App() {
  return (
    <SessionProvider>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hindi" element={<HindiPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<LegalPage id="privacy" />} />
        <Route path="/terms" element={<LegalPage id="terms" />} />
        <Route path="/cookie" element={<LegalPage id="cookie" />} />
        <Route path="/refund" element={<LegalPage id="refund" />} />
        <Route path="/acceptable-use" element={<LegalPage id="acceptable-use" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
        <Route path="/sign-up" element={<Navigate to="/register" replace />} />
        <Route path="/create-account" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SessionProvider>
  );
}
