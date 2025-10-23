import { useState, useEffect, useRef } from "react";
import { DramaCard } from "../components/DramaCard";
import { getAiRecommendation, getSearchedDramas } from "../js/fetch";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Hearts } from "react-loader-spinner";
import "../css/recommend.css";

const allOptions = {
  genre: {
    order: 1,
    values: [
      "romance",
      "comedy",
      "thriller",
      "action",
      "fantasy",
      "historical",
      "horror",
      "sports",
      "celebrity",
      "legal",
      "sci-fi",
    ],
  },
  length: {
    order: 2,
    values: [
      "Short: 1-10 episodes",
      "Standard: 11-16 episodes",
      "Long: 16+ episodes",
    ],
  },
  mood: {
    order: 3,
    values: [
      "funny",
      "heartwarming",
      "teenage",
      "motivational",
      "tearjerker",
      "light",
      "tense",
      "dramatic",
      "adventurous",
      "energetic",
    ],
  },
  gems: { order: 4, values: ["I prefer popular ones!", "Yes, sure!"] },
};

const specialMessages = {
  gems: "Would you like to discover less popular dramas?",
};

const getInitialData = () => {
  const raw = sessionStorage.getItem("aiRecommendSession");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem("aiRecommendSession");
    return {};
  }
};

export function AIRecommend() {
  const initialData = getInitialData();
  const { userData } = useUser();

  const [counter, setCounter] = useState(initialData.counter || 1);
  const [decisions, setDecisions] = useState(initialData.decisions || []);
  const [recommendation, setRecommendation] = useState(
    initialData.recommendation || false
  );
  const [result, setResult] = useState(initialData.result || "");
  const [titles, setTitles] = useState(initialData.titles || []);
  const [dramas, setDramas] = useState(initialData.dramas || []);
  const [options, setOptions] = useState(
    initialData.counter
      ? Object.values(allOptions).find(
          (opt) => opt.order === initialData.counter
        )?.values
      : allOptions.genre.values
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("ai");
    return () => document.body.classList.remove("ai");
  }, []);

  const hasFetchedDramasRef = useRef(initialData.dramas?.length > 0);

  useEffect(() => {
    document.body.classList.add("nav-dark");
    return () => document.body.classList.remove("nav-dark");
  }, []);

  useEffect(() => {
    const sessionData = {
      counter,
      decisions,
      recommendation,
      result,
      titles,
      dramas,
    };
    try {
      sessionStorage.setItem("aiRecommendSession", JSON.stringify(sessionData));
    } catch {}
  }, [counter, decisions, recommendation, result, titles, dramas]);

  useEffect(() => {
    const current = Object.values(allOptions).find(
      (option) => option.order === counter
    );
    if (current) setOptions(current.values);
  }, [counter]);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        const genre = decisions[0];
        const length = decisions[1];
        const mood = decisions[2];
        const gems = decisions[3] === "I prefer popular ones!" ? false : true;

        const data = await getAiRecommendation({ genre, length, mood, gems });
        setResult(data.recommendation);
        setTitles(data.titles || []);

        const fetchedDramas = await Promise.all(
          (data.titles || []).map(async (t) => {
            try {
              const res = await getSearchedDramas(t.name);
              if (Array.isArray(res)) return res[0] || null;
              if (res?.results && Array.isArray(res.results))
                return res.results[0] || null;
              return null;
            } catch {
              return null;
            }
          })
        );
        setDramas(fetchedDramas.filter(Boolean));
        hasFetchedDramasRef.current = true;
      } catch (err) {
        console.error("Error fetching AI recommendation:", err);
      } finally {
        setLoading(false);
      }
    };

    if (counter > 4 && decisions.length === 4 && !recommendation) {
      setRecommendation(true);
      fetchRecommendation();
    }
  }, [counter, decisions, recommendation]);

  useEffect(() => {
    const fetchDramasFromTitles = async () => {
      if (!titles || titles.length === 0) return;
      if (hasFetchedDramasRef.current) return;
      hasFetchedDramasRef.current = true;

      setLoading(true);
      try {
        const fetched = await Promise.all(
          titles.map(async (t) => {
            try {
              const res = await getSearchedDramas(t.name);
              if (Array.isArray(res)) return res[0] || null;
              if (res?.results && Array.isArray(res.results))
                return res.results[0] || null;
              return null;
            } catch {
              return null;
            }
          })
        );
        setDramas(fetched.filter(Boolean));
      } finally {
        setLoading(false);
      }
    };

    if (recommendation && titles.length > 0 && dramas.length === 0) {
      fetchDramasFromTitles();
    }
  }, [recommendation, titles, dramas]);

  const handleClick = (value) => {
    setDecisions((prev) => [...prev, value]);
    setCounter((prev) => prev + 1);
  };

  const handleReset = () => {
    sessionStorage.removeItem("aiRecommendSession");
    hasFetchedDramasRef.current = false;
    setCounter(1);
    setDecisions([]);
    setRecommendation(false);
    setResult("");
    setTitles([]);
    setDramas([]);
    setOptions(allOptions.genre.values);
    setLoading(false);
  };

  const currentOptionEntry = Object.entries(allOptions).find(
    ([key, option]) => option.order === counter
  );
  const currentOptionKey = currentOptionEntry?.[0];
  const currentOptionValues = currentOptionEntry?.[1]?.values || [];

  return (
    <div className="recommend-wrap">
      <h1>AI Drama Recommendation Tool</h1>
      {!recommendation && (
        <p className="subtitle">
          Get recommendations for K-Dramas based on your preferences
        </p>
      )}

      {!recommendation && (
        <div className="progress-bar">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              style={{ backgroundColor: counter > step ? "#fb7892" : "" }}
            />
          ))}
        </div>
      )}

      {!recommendation ? (
        <div className="options">
          <h3>
            {specialMessages[currentOptionKey] || `${currentOptionKey || ""}`}
          </h3>
          <div className="options-wrap">
            {currentOptionValues.map((value, index) => (
              <div
                key={index}
                onClick={() => handleClick(value)}
                className="option"
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="result">
          <h2>Your AI Drama Recommendations:</h2>
          <div className="options-wrap selected-wrap">
            {decisions.map((d, i) => (
              <span className="option selected" key={i}>
                {d}
              </span>
            ))}
          </div>
          <p
            className="drama-names"
            dangerouslySetInnerHTML={{
              __html: (result || "").replace(/"([^"]+)"/g, (match, p1) => {
                return `<br/><span>"${p1}"</span>`;
              }),
            }}
          ></p>

          {loading ? (
            <div className="loader">
              <Hearts
                height="80"
                width="80"
                color="#fb7892"
                ariaLabel="hearts-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
              <p style={{ color: "#7c7c7c" }}>
                We are finding perfect K-Dramas for you...
              </p>
            </div>
          ) : dramas.length > 0 ? (
            <div className="drama-results">
              {dramas.map((drama) => (
                <Link
                  key={drama.id}
                  to={`/drama/${drama.slug}`}
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
              ))}
            </div>
          ) : (
            <p className="no-results">
              Couldn't find matching dramas, please try a different combo 💫
            </p>
          )}

          {!loading && (
            <button className="new-recommend-btn" onClick={handleReset}>
              Get New Recommendations
            </button>
          )}
        </div>
      )}
    </div>
  );
}
