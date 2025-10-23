import { useToggle } from "../hooks/useToggle";
import { addFavorite, removeFavorite } from "../js/fetch";
import { useUser } from "../context/UserContext";
import { useSound } from "../context/SoundContext";
import clickSoundFile from "../assets/sounds/click.mp3";
import sadSoundFile from "../assets/sounds/sad.mp3";
import { useRef, useState, useEffect } from "react";
import "../css/favoriteButton.css";

export function FavoriteButton({ dramaId }) {
  const { userData } = useUser();
  const { hasSound } = useSound();
  const audioRef = useRef(null);
  const audioRefSad = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [animateSad, setAnimateSad] = useState(false);

  const {
    isInList: isFavorite,
    toggle,
    setIsInList,
  } = useToggle({
    dramaId,
    listName: "favorites",
    addFn: addFavorite,
    removeFn: removeFavorite,
  });

  useEffect(() => {
    if (!userData) {
      setIsInList(false);
    } else {
      setIsInList(userData.favorites.includes(dramaId));
    }
  }, [userData, dramaId, setIsInList]);

  const handleClick = async (e) => {
    if (userData) {
      if (!isFavorite) {
        if (hasSound) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        setAnimate(true);
        setTimeout(() => setAnimate(false), 800);
      } else {
        if (hasSound) {
          audioRefSad.current.currentTime = 0;
          audioRefSad.current.play();
        }
        setAnimateSad(true);
        setTimeout(() => setAnimateSad(false), 800);
      }
    }

    toggle(e);
  };

  return (
    <>
      <audio ref={audioRef} src={clickSoundFile} preload="auto" />
      <audio ref={audioRefSad} src={sadSoundFile} preload="auto" />

      <button
        type="button"
        className={`heart ${isFavorite ? "active" : ""} ${
          animate ? "sparkle" : ""
        } ${animateSad ? "sad" : ""}`}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={handleClick}
      >
        ♥
      </button>
    </>
  );
}
