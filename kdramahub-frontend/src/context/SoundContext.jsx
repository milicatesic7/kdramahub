import { createContext, useContext, useState } from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [hasSound, setHasSound] = useState(() => {
    const saved = sessionStorage.getItem("hasSound");
    return saved === "true";
  });

  return (
    <SoundContext.Provider
      value={{
        hasSound,
        setHasSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
