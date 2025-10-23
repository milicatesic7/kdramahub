import { useState, useRef } from "react";
import { postUserData } from "../js/fetch.js";
import "../css/usermodal.css";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import LogoIcon from "../assets/images/logo-icon.png";
import Heart from "../assets/images/heart.png";
import Sparkle from "../assets/sounds/sparkle.mp3";
import { useSound } from "../context/SoundContext";
import X from "../assets/images/x.png";

export function UserModal() {
  const [formType, setFormType] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loginUser } = useUser();
  const { closeUserModal, showMessageModal, setMessageModalContent } =
    useModal();

  const sparkleSound = useRef(null);
  const { hasSound } = useSound();

  const makeSound = () => {
    if (hasSound && sparkleSound.current) {
      sparkleSound.current.currentTime = 0;
      sparkleSound.current.play();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload =
      formType === "signup" ? { name, email, password } : { email, password };
    showMessageModal?.("And...", "It's coming...");
    const user = await postUserData(payload, formType, showMessageModal);

    if (user) {
      loginUser(user);
      closeUserModal();

      showMessageModal(
        "Success",
        formType === "signup"
          ? "Account created successfully!"
          : "Logged in successfully!"
      );
    }
  };

  return (
    <div className="user-modal-overlay" onClick={closeUserModal}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-close" onClick={closeUserModal}>
          <img src={X} alt="Close" />
        </button>

        <div className="logoIcon">
          <audio src={Sparkle} ref={sparkleSound}></audio>
          <img src={LogoIcon} className="hand" alt="Logo" />
          <img
            src={Heart}
            className="heartLogo"
            onMouseEnter={makeSound}
            alt="Heart"
          />
        </div>

        <h1>{formType === "signup" ? "Create Account" : "Welcome!"}</h1>

        {formType === "signup" && (
          <form onSubmit={handleSubmit} className="user-form">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Sign up</button>
            <p>
              Already have an account?{" "}
              <span onClick={() => setFormType("login")}>Log in</span>
            </p>
          </form>
        )}

        {formType === "login" && (
          <form onSubmit={handleSubmit} className="user-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Log in</button>
            <p>
              Don't have an account?{" "}
              <span onClick={() => setFormType("signup")}>Sign up</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
