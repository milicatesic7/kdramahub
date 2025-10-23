import Star from "../assets/images/star.png";
import HalfStar from "../assets/images/star-half.png";
import EmptyStar from "../assets/images/star-empty.png";
import "../css/stars.css";

export function Stars({ drama, trigger }) {
  let votes = drama.vote_average / 2;
  let fullStars = Math.floor(votes);
  let hasHalf = votes - fullStars >= 0.5;

  const array = [];
  for (let i = 0; i < fullStars; i++) array.push("star");
  if (hasHalf) array.push("half");
  while (array.length < 5) array.push("empty");

  return (
    <div className={`star-wrapper ${trigger ? "in-view" : ""}`}>
      {array.map((el, index) => {
        const src = el === "star" ? Star : el === "half" ? HalfStar : EmptyStar;

        return (
          <img
            src={src}
            key={index}
            alt={el + " star"}
            width={16}
            height={16}
            className={`sparkle-star star-${index}`}
          />
        );
      })}
    </div>
  );
}
