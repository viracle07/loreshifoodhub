"use client";

import { createContext, useContext } from "react";
import { auth, db, storage } from "./client";

const FirebaseContext = createContext(null);

export function FirebaseProvider({ children }) {
  return (
    <FirebaseContext.Provider value={{ auth, db, storage }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);

  if (!context) {
    throw new Error("useFirebase must be used inside FirebaseProvider");
  }

  return context;
}