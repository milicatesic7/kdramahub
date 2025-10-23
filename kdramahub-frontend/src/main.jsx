import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ModalProvider } from "./context/ModalContext";
import { SoundProvider } from "./context/SoundContext";
import App from "./App.jsx";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <SoundProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </SoundProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
