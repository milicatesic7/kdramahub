import { FavoriteButton } from "./FavoriteButton";
import { WatchButton } from "./WatchButton";
import { useRef, useState, useEffect } from "react";
import { Stars } from "./Stars";
import "../css/index.css";

export function DramaCard({ drama }) {
  const cardRef = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.9 }
    );

    if (cardRef.current) observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="drama-card" ref={cardRef}>
      <FavoriteButton dramaId={drama.id} />
      <WatchButton dramaId={drama.id} />

      <div className="poster-wrapper">
        <img
          src={`https://image.tmdb.org/t/p/w500${drama.poster_path}`}
          alt={drama.name}
          className="poster"
        />
        <div className="poster-overlay"></div>
      </div>

      <div className="drama-card-content">
        <h3>{drama.name}</h3>
        <div className="additional">
          <p>{drama.first_air_date?.slice(0, 4)} |</p>
          <Stars drama={drama} trigger={inView} />
        </div>
      </div>
    </div>
  );
}
