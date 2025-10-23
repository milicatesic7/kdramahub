import { useState, useRef, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import { useSound } from "../context/SoundContext";
import Ring from "../assets/sounds/modal-message.mp3";
import "../css/MessageModal.css";

export function MessageModal({
  heading,
  msg,
  special = false,
  timeout = 7000,
}) {
  const [isSpecial, setIsSpecial] = useState(special);
  const [specialSeen, setSpecialSeen] = useState(false);
  const ringSound = useRef(null);
  const { openUserModal, setMessageModalContent } = useModal();
  const { hasSound } = useSound();

  useEffect(() => {
    if (hasSound && ringSound.current) {
      ringSound.current.currentTime = 0;
      ringSound.current.play();
    }

    const id = setTimeout(() => setMessageModalContent(null), timeout);
    return () => clearTimeout(id);
  }, [hasSound, isSpecial, timeout, setMessageModalContent]);

  return isSpecial ? (
    !specialSeen && (
      <div className="msg-modal-wrap">
        <audio src={Ring} ref={ringSound}></audio>
        <h2>{heading}</h2>
        <p>
          {msg}
          <span
            onClick={() => {
              setSpecialSeen(true);
              openUserModal();
            }}
          >
            log in
          </span>
          to use this feature
        </p>
      </div>
    )
  ) : (
    <div className="msg-modal-wrap">
      <audio src={Ring} ref={ringSound}></audio>
      <h2>{heading}</h2>
      <p>{msg}</p>
    </div>
  );
}
