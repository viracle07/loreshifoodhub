"use client";
import { useEffect, useId, useState } from "react";
import { Download } from "lucide-react";
export default function AdminInstall() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);
  const helpId = useId();
  useEffect(() => {
    const display = window.matchMedia("(display-mode: standalone)");
    setInstalled(display.matches || navigator.standalone === true);
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const before = (event) => { event.preventDefault(); setPrompt(event); };
    const done = () => { setInstalled(true); setPrompt(null); setShowHelp(false); };
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", done);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/admin-sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => setError("App setup could not finish. Refresh to try again."));
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  async function install() {
    setError("");
    if (!prompt) {
      setShowHelp(true);
      return;
    }
    setInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      setShowHelp(choice.outcome !== "accepted");
    } catch {
      setPrompt(null);
      setShowHelp(true);
      setError("Automatic installation is unavailable. Follow the steps below.");
    } finally {
      setInstalling(false);
    }
  }
  return <section className="rounded-2xl border border-[#E7E4DC] bg-white p-4">
    <h2 className="flex items-center gap-2 text-sm font-bold"><Download size={18} /> Install Loreshi Admin</h2>
    <p className="mt-2 text-xs text-gray-500">Open your dashboard from your phone’s home screen. Sign-in and an internet connection are required.</p>
    <button type="button" onClick={install} disabled={installed || installing}
      aria-expanded={showHelp} aria-controls={helpId}
      className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#68912B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#527523] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#68912B] disabled:opacity-60">
      <Download size={18} aria-hidden="true" />
      {installed ? "App Installed" : installing ? "Opening installer…" : "Install Admin App"}
    </button>
    <div id={helpId} hidden={!showHelp} className="mt-4 rounded-xl bg-[#F5F8EF] p-4 text-sm leading-relaxed text-gray-700">
      <p className="font-semibold">Install on your device</p>
      {ios ? <p className="mt-2">Open this page in Safari, tap Share, choose Add to Home Screen, then tap Add.</p>
        : <><p className="mt-2">Open this page in Chrome or Edge. Open the browser menu and choose Install app, Install this site as an app, or Add to Home screen.</p>
          <p className="mt-2">On iPhone or iPad, open the page in Safari, tap Share, then Add to Home Screen.</p></>}
      <p className="mt-2 text-xs text-gray-600">If you are using an in-app preview, open the page in your device’s browser to install it. On your phone, use the deployed website address.</p>
      <button type="button" onClick={() => setShowHelp(false)} className="mt-3 font-semibold text-[#4C6B1C] underline">Close instructions</button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
  </section>;
}
