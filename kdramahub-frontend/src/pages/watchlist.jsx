import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { DramaCard } from "../components/DramaCard";
import { Link } from "react-router-dom";
import { MessageModal } from "../components/MessageModal";
import { useModal } from "../context/ModalContext";
import { loadAllWatches } from "../js/fetch";
import { ColorRing } from "react-loader-spinner";
import "../css/watchlist.css";

export function Watchlist() {
  const { userData, loginUser } = useUser();
  const [watchDramas, setWatchDramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openUserModal } = useModal();

  useEffect(() => {
    document.body.classList.add("nav-dark");
    return () => document.body.classList.remove("nav-dark");
  }, []);

  useEffect(() => {
    if (!userData) {
      setWatchDramas([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadWatches() {
      setLoading(true);
      try {
        const data = await loadAllWatches(userData.id);
        if (!isMounted) return;

        setWatchDramas(data);
        const watchIds = data.map((d) => d.id);
        if (JSON.stringify(userData.watchlist) !== JSON.stringify(watchIds)) {
          loginUser({ ...userData, watchlist: watchIds });
        }
      } catch (err) {
        console.error("Error loading watchlist:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadWatches();

    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    if (!userData?.watchlist) return;

    setWatchDramas((prev) =>
      prev.map((drama) => {
        if (!userData.watchlist.includes(drama.id)) {
          return { ...drama, isRemoving: true };
        }
        return drama;
      })
    );

    const timeout = setTimeout(() => {
      setWatchDramas((prev) => prev.filter((drama) => !drama.isRemoving));
    }, 500);

    return () => clearTimeout(timeout);
  }, [userData?.watchlist]);

  if (!userData)
    return (
      <>
        <MessageModal heading="Oops!" msg="You need to" special={true} />
        <div className="watch-page">
          <p className="watch-heading">
            You need to{" "}
            <span
              onClick={() => {
                openUserModal();
              }}
            >
              log in
            </span>{" "}
            to have a watchlist
          </p>
        </div>
      </>
    );

  return (
    <div className="watch-page">
      <p className="watch-heading">Your watchlist</p>

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
          <p style={{ color: "#7c7c7c" }}>Your watchlist is coming...</p>
        </div>
      )}

      {!loading && watchDramas.length === 0 && (
        <p className="watch-heading">
          You haven't added any dramas to your watchlist yet.
        </p>
      )}

      <div className="drama-grid">
        {watchDramas.map((drama) => {
          const slug = drama.name.toLowerCase().split(" ").join("-");
          return (
            <Link
              key={`${drama.id}-`}
              to={`/drama/${slug}`}
              state={{
                drama,
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
