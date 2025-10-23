import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { DramaCard } from "../components/DramaCard";
import { Link } from "react-router-dom";
import { MessageModal } from "../components/MessageModal";
import { useModal } from "../context/ModalContext";
import { loadAllFavorites } from "../js/fetch";
import { ColorRing } from "react-loader-spinner";
import "../css/favorites.css";

export function Favorites() {
  const { userData } = useUser();
  const [favoriteDramas, setFavoriteDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openUserModal } = useModal();

  useEffect(() => {
    document.body.classList.add("in-favorites-page");
    return () => document.body.classList.remove("in-favorites-page");
  }, []);

  useEffect(() => {
    if (!userData) {
      setFavoriteDramas([]);
      setLoading(false);
      return;
    }

    async function loadFavorites() {
      setLoading(true);
      try {
        const data = await loadAllFavorites(userData.id);
        setFavoriteDramas(data);
      } catch (err) {
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [userData]);

  if (!userData)
    return (
      <>
        <MessageModal heading="Oops!" msg="You need to" special={true} />
        <div className="favorites-page">
          <p className="favorites-heading">
            You need to{" "}
            <span
              onClick={() => {
                openUserModal();
              }}
            >
              log in
            </span>{" "}
            to have favorites
          </p>
        </div>
      </>
    );

  return (
    <div className="favorites-page">
      <p className="favorites-heading">Your favorites</p>

      {loading && (
        <div className="loader">
          <ColorRing
            visible={true}
            height="65"
            width="65"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={["#fdf5f0", "#fadadd", "#eec6ca", "#ff9a8a", "#fb7892"]}
          />
          <p>Your favorites are coming...</p>
        </div>
      )}

      {!loading && favoriteDramas.length === 0 && (
        <p className="favorites-heading">
          You haven't added any favorites yet.
        </p>
      )}

      <div className="horizontal-scroller">
        {favoriteDramas.map((drama) => {
          const slug = drama.name.toLowerCase().split(" ").join("-");
          return (
            <Link
              key={`${drama.id}--`}
              to={`/drama/${slug}`}
              state={{
                drama: {
                  ...drama,
                  genre_ids: drama.genre_ids || [],
                },
                id: drama.id,
                isFavorite: userData?.favorites.includes(drama.id),
                isToWatch: userData?.watchlist.includes(drama.id),
              }}
            >
              <DramaCard drama={drama} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
