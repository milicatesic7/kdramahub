import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDramas, getRecommendedDramas } from "../js/fetch.js";
import { Stars } from "./Stars";
import { FavoriteButton } from "../components/FavoriteButton";
import { useUser } from "../context/UserContext";
import { WatchButton } from "./WatchButton.jsx";
import { Link } from "react-router-dom";
import Gem from "../assets/images/diamond.png";
import Fire from "../assets/images/fire.png";
import "../css/dramapage.css";

function titleCase(str) {
  return str
    .split(/[-\s]+/)
    .map((word) =>
      word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ")
    .replace(/\s,/, ",");
}

export function DramaPage() {
  const { id } = useParams();
  const { userData } = useUser();
  const location = useLocation();
  const [drama, setDrama] = useState(null);
  const [page] = useState(1);
  const [popularityModal, setPopularityModal] = useState(false);
  const [recommendedDramas, setRecommendedDramas] = useState([]);

  useEffect(() => {
    document.querySelector(".navbar").classList.add("pages");
    document.querySelector(".page-wrapper").classList.add("pages-wr");

    return () => {
      document.querySelector(".navbar").classList.remove("pages");
      document.querySelector(".page-wrapper").classList.remove("pages-wr");
    };
  }, []);

  useEffect(() => {
    const fetchDrama = async () => {
      if (location.state?.drama) {
        if (!location.state.drama.genre_ids) {
          const allDramas = await getDramas(page);
          const found = allDramas.find((d) => d.id === location.state.drama.id);
          setDrama(found || location.state.drama);
        } else {
          setDrama(location.state.drama);
        }
      } else {
        const allDramas = await getDramas(page);
        const dramaSlug = id.toLowerCase();
        const found = allDramas.find(
          (d) => d.name.toLowerCase().split(" ").join("-") === dramaSlug
        );
        setDrama(found || null);
      }
    };

    fetchDrama();
  }, [id, location.state, page]);

  useEffect(() => {
    if (drama && drama.genre_ids) {
      const fetchRecommended = async () => {
        const result = await getRecommendedDramas(drama.genre_ids, drama);
        setRecommendedDramas(result);
      };
      fetchRecommended();
    }
  }, [drama]);

  if (!drama) return <p>Drama not found or loading...</p>;

  return (
    <div className="drama-page">
      <div className="poster-holder">
        <img
          src={`https://image.tmdb.org/t/p/w500${drama.poster_path}`}
          alt={drama.name}
          className="drama-poster"
        />
        {popularityModal && (
          <div className="popularityModal">
            {drama.popularity > 50000
              ? "This drama is very popular"
              : "This is a hidden gem"}
          </div>
        )}
        <FavoriteButton
          dramaId={drama.id}
          initialFavorite={location.state?.isFavorite || false}
        />
        <WatchButton
          dramaId={drama.id}
          initialFavorite={location.state?.isToWatch || false}
        />
        {drama.popularity > 50000 ? (
          <img
            src={Fire}
            className="img-popularity"
            onClick={() => setPopularityModal(!popularityModal)}
          />
        ) : (
          <img
            src={Gem}
            className="img-popularity"
            onClick={() => setPopularityModal(!popularityModal)}
          />
        )}
      </div>

      <div className="drama-info">
        <h1 className="drama-title">{drama.name}</h1>
        <p style={{ color: "#fb7892" }}>{drama.first_air_date.slice(0, 4)}</p>
        <p className="drama-overview">{drama.overview}</p>
        <div className="ratings-wrapper">
          <div className="vote-rating">
            <span className="vote-score">{drama.vote_average.toFixed(2)}</span>
            <span className="vote-count">({drama.vote_count} votes)</span>
            <Stars drama={drama} trigger={true} />
          </div>
          <div className="popularity">Popularity: {drama.popularity}</div>
        </div>
      </div>

      {recommendedDramas.length > 0 && (
        <div className="recommendations">
          <h2>Similar K-Dramas</h2>
          {recommendedDramas.map((recDrama) => {
            const slug = recDrama.name.toLowerCase().split(" ").join("-");
            return (
              <Link
                key={recDrama.id}
                to={`/drama/${slug}`}
                state={{
                  drama: recDrama,
                  isFavorite: userData?.favorites.includes(recDrama.id),
                  isToWatch: userData?.watchlist.includes(recDrama.id),
                }}
              >
                <div className="recommHold">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${recDrama.poster_path}`}
                    alt={recDrama.name}
                  />
                  <h3>{recDrama.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
