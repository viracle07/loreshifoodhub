import { Suspense } from "react";

import AuthPage from "./AuthPage";

function AuthPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFDF8] px-5">
      <p className="text-sm text-gray-600">
        Loading authentication...
      </p>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPage />
    </Suspense>
  );
}