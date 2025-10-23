import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getDramas, getSearchedDramas, getPopularDramas } from "../js/fetch.js";
import { DramaCard } from "../components/DramaCard";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useSound } from "../context/SoundContext";
import { useModal } from "../context/ModalContext";
import swooshSoundFile from "../assets/sounds/swoosh.mp3";
import { ColorRing } from "react-loader-spinner";
import "../css/index.css";

export function Home() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const { userData } = useUser();
  const [bgImages, setBgImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allDramas, setAllDramas] = useState([]);
  const [showToTop, setShowToTop] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);
  const audioRef = useRef(null);
  const { hasSound, setHasSound } = useSound();
  const { showMessageModal } = useModal();
  const [soundChoice, setSoundChoice] = useState(() => {
    return sessionStorage.getItem("hasSound") === null;
  });

  const fetchDramas = useCallback(async (p) => {
    setLoading(true);
    try {
      const dramas = await getDramas(p);
      setAllDramas((prev) => (p === 1 ? dramas : [...prev, ...dramas]));
    } catch (error) {
      showMessageModal("Oops!", "Unable to fetch dramas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearchResults = useCallback(
    async (query, startPage = 1, pagesToFetch = 3) => {
      setLoading(true);
      try {
        let combinedResults = [];
        let totalPages = 1;

        for (let p = startPage; p < startPage + pagesToFetch; p++) {
          const { results, totalPages: fetchedTotal } = await getSearchedDramas(
            query,
            p
          );
          combinedResults = combinedResults.concat(results);
          totalPages = fetchedTotal;
          if (p >= totalPages) break;
        }

        setSearchResults((prev) =>
          startPage === 1 ? combinedResults : [...prev, ...combinedResults]
        );
        setSearchTotalPages(totalPages);
        setSearchPage(startPage + pagesToFetch - 1);
      } catch (error) {
        showMessageModal("Oops!", "Error fetching search");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 150 &&
        !loading
      ) {
        if (search.trim() === "" && page < 100) {
          setPage((prev) => prev + 1);
        } else if (search.trim() !== "" && searchPage < searchTotalPages) {
          fetchSearchResults(search, searchPage + 1, 1);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, search, searchPage, searchTotalPages, fetchSearchResults]);

  useEffect(() => {
    window.resetHomeSearch = () => {
      setSearch("");
      setSearchResults([]);
      setSearchPage(1);
      setSearchTotalPages(1);
      setPage(1);
      setAllDramas([]);
      fetchDramas(1);
    };
    return () => (window.resetHomeSearch = null);
  }, [fetchDramas]);

  useEffect(() => {
    if (search.trim() === "") fetchDramas(page);
  }, [page, search, fetchDramas]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (search.trim() === "") {
      window.resetHomeSearch?.();
      return;
    }

    searchTimeout.current = setTimeout(() => {
      setSearchResults([]);
      setSearchPage(1);
      fetchSearchResults(search, 1, 3);
    }, 250);

    return () => clearTimeout(searchTimeout.current);
  }, [search, fetchSearchResults]);

  const displayedDramas = useMemo(
    () =>
      search.trim() === "" && searchResults.length === 0
        ? allDramas
        : searchResults,
    [search, allDramas, searchResults]
  );

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (hasSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowToTop(window.scrollY > 300 && page > 2);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page]);

  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        const dramas = await getPopularDramas(5);
        const images = dramas
          .map((d) => d.backdrop_path || d.poster_path)
          .filter(Boolean)
          .map((path) => `https://image.tmdb.org/t/p/original${path}`);
        setBgImages(images);
      } catch (err) {
        showMessageModal("Oops!", "Error fetching background");
      }
    }
    fetchBackgrounds();
  }, []);

  useEffect(() => {
    if (bgImages.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bgImages.length;
      const img = new Image();
      img.src = bgImages[nextIndex];
      img.onload = () => setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [bgImages, currentIndex]);

  return (
    <div>
      {soundChoice && (
        <div className="sound-modal">
          <p>
            This website uses <span>audio interactions</span>
          </p>
          <p>Do you want to play them?</p>
          <button
            onClick={() => {
              setHasSound(true);
              sessionStorage.setItem("hasSound", "true");
              setSoundChoice(false);
            }}
          >
            Yes!
          </button>
          <button
            onClick={() => {
              setHasSound(false);
              sessionStorage.setItem("hasSound", "false");
              setSoundChoice(false);
            }}
          >
            I'll skip
          </button>
        </div>
      )}
      <div className="hero">
        {bgImages.map((img, index) => (
          <div
            key={index}
            className={`hero-bg ${index === currentIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <div className="hero-overlay" />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for your favorite K-Dramas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p>Can't decide which K-Drama to watch?</p>
          </div>

          <div className="promo">
            <p className="special">
              Try our Premium{" "}
              <Link to="ai-recommend">
                <span>AI Recommend tool</span>
              </Link>
            </p>
            <p>
              to get recommendations according to your <span>unique</span> taste
            </p>
          </div>

          <div className="hero-wave" />
        </div>
      </div>

      <div className="drama-grid">
        {displayedDramas.map((drama) => {
          const slug = drama.name.toLowerCase().split(" ").join("-");
          return (
            <Link
              key={`${drama.id}---`}
              to={`/drama/${slug}`}
              state={{
                drama,
                id: drama.id,
                isFavorite: userData?.favorites.includes(drama.id),
                isToWatch: userData?.watchlist.includes(drama.id),
              }}
              onClick={() => window.resetHomeSearch?.()}
              className="drama-link-wrapper"
            >
              <DramaCard drama={drama} />
            </Link>
          );
        })}
        {loading && (
          <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={["#fdf5f0", "#fadadd", "#eec6ca", "#ff9a8a", "#fb7892"]}
          />
        )}
      </div>

      {showToTop && (
        <button onClick={toTop} className="toTop-btn">
          ↑
        </button>
      )}
      <audio ref={audioRef} src={swooshSoundFile} preload="auto"></audio>
    </div>
  );
}
