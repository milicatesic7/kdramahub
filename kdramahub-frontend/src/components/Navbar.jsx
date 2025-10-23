import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { useSound } from "../context/SoundContext";
import LogoIcon from "../assets/images/logo-icon-nav.png";
import Heart from "../assets/images/heart-nav.png";
import UserImg from "../assets/images/user.png";
import UserImgYellow from "../assets/images/user-hover.png";
import Sparkle from "../assets/sounds/sparkle.mp3";
import "../css/navbar.css";

export function Navbar() {
  const { userLogged, userData } = useUser();
  const [userHover, setUserHover] = useState(false);
  const { openUserModal, openAccountInfo } = useModal();
  const sparkleSound = useRef(null);

  const { hasSound } = useSound();

  const makeSound = () => {
    if (hasSound && sparkleSound.current) {
      sparkleSound.current.currentTime = 0;
      sparkleSound.current.play();
    }
  };

  useEffect(() => {
    const img = new Image();
    img.src = UserImgYellow;
  }, []);

  return (
    <nav className="navbar">
      <Link to="/" onClick={() => window.resetHomeSearch?.()}>
        <div className="logo">
          <audio src={Sparkle} ref={sparkleSound}></audio>
          <div className="logoIconNav">
            <img
              src={Heart}
              className="heartLogoNav"
              onMouseEnter={makeSound}
            ></img>
            <img src={LogoIcon} className="handNav"></img>
          </div>
          <div className="logoText">
            <h1>K-Drama</h1>
            <p>hub</p>
          </div>
        </div>
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/" onClick={() => window.resetHomeSearch?.()}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/favorites">Favorites</Link>
        </li>
        <li>
          <Link to="/watchlist">Watchlist</Link>
        </li>
        <li>
          <Link to="/ai-recommend">AI Recommend</Link>
        </li>

        <div style={{ marginLeft: "auto" }}>
          {userLogged ? (
            <button
              onClick={openAccountInfo}
              className="userBtn"
              onMouseEnter={() => setUserHover(true)}
              onMouseLeave={() => setUserHover(false)}
            >
              {userData?.name || "My Account"}
              <img src={userHover ? UserImgYellow : UserImg}></img>
            </button>
          ) : (
            <button
              onClick={openUserModal}
              className="userBtn"
              onMouseEnter={() => setUserHover(true)}
              onMouseLeave={() => setUserHover(false)}
            >
              My Account
              <img src={userHover ? UserImgYellow : UserImg} alt="User" />
            </button>
          )}
        </div>
      </ul>
    </nav>
  );
}
