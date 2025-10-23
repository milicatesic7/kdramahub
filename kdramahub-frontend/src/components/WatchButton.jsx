import { useToggle } from "../hooks/useToggle";
import { addWatch, removeWatch } from "../js/fetch";
import { useUser } from "../context/UserContext";
import { useSound } from "../context/SoundContext";
import addSoundFile from "../assets/sounds/ding.mp3";
import removeSoundFile from "../assets/sounds/boop.mp3";
import { useRef, useState } from "react";
import "../css/watchbtn.css";

export function WatchButton({ dramaId }) {
  const {
    isInList: isToWatch,
    toggle,
    loading,
  } = useToggle({
    dramaId,
    listName: "watchlist",
    addFn: addWatch,
    removeFn: removeWatch,
  });

  const { hasSound } = useSound();
  const audioRefAdd = useRef(null);
  const audioRefRemove = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animateSad, setAnimateSad] = useState(false);
  const { userData } = useUser();

  const handleClick = async (e) => {
    if (userData) {
      if (!isToWatch) {
        if (hasSound) {
          audioRefAdd.current.currentTime = 0;
          audioRefAdd.current.play();
        }
        setAnimate(true);
        setTimeout(() => setAnimate(false), 800);
      } else {
        if (hasSound) {
          audioRefRemove.current.currentTime = 0;
          audioRefRemove.current.play();
        }
        setAnimateSad(true);
        setTimeout(() => setAnimateSad(false), 800);
      }
    }
    toggle(e);
  };

  return (
    <>
      <audio ref={audioRefAdd} src={addSoundFile} preload="auto" />
      <audio ref={audioRefRemove} src={removeSoundFile} preload="auto" />

      <button
        type="button"
        className={`watch ${isToWatch ? "watched" : ""} ${
          animate ? "sparkle" : ""
        } ${animateSad ? "sad" : ""}`}
        title={isToWatch ? "Remove from watchlist" : "Add to watchlist"}
        onClick={handleClick}
      >
        ⏱
      </button>
    </>
  );
}
