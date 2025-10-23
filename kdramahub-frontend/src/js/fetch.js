const TMDB_API_KEY = "0ce5d43298c76d46ecbd9f0cad57864c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const BACKEND_URL = "https://localhost:7147/api/user";

export async function getDramas(page = 1, showMessageModal) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?with_original_language=ko&api_key=${TMDB_API_KEY}&page=${page}`
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.results;
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to fetch dramas. Please try again!");
    return [];
  }
}

export async function getSearchedDramas(
  queryString,
  page = 1,
  showMessageModal
) {
  try {
    const query = encodeURIComponent(queryString.toLowerCase());
    const res = await fetch(
      `${TMDB_BASE_URL}/search/tv?query=${query}&with_original_language=ko&page=${page}&api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return {
      results: data.results.filter((show) => show.original_language === "ko"),
      totalPages: data.total_pages,
    };
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to search dramas. Please try again!");
    return { results: [], totalPages: 0 };
  }
}

export async function findDrama(dramaId, showMessageModal) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/tv/${dramaId}?api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to fetch drama.");
    return null;
  }
}

export async function getPopularDramas(limit = 5, showMessageModal) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?with_original_language=ko&sort_by=popularity.desc&api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.results
      .filter((show) => show.original_language === "ko")
      .slice(0, limit);
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to fetch popular dramas.");
    return [];
  }
}

export async function getRecommendedDramas(
  genre_ids,
  current,
  showMessageModal
) {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?with_original_language=ko&with_genres=${genre_ids}&api_key=${TMDB_API_KEY}`
    );
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.results.filter((drama) => drama.id !== current.id).slice(0, 4);
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to fetch recommendations.");
    return [];
  }
}

export async function postUserData(user, type, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
      credentials: "include",
    });
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Login/Signup failed", msg || "Unknown error");
      return null;
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Login/Signup failed", err.message || "Unknown error");
    return null;
  }
}

export async function changePassword(
  userId,
  currentPassword,
  newPassword,
  confirmPassword,
  showMessageModal
) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
        ConfirmPassword: confirmPassword,
      }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      showMessageModal?.("Oops!", data?.message || "Failed to change password");
      return { success: false, message: data?.message };
    }

    showMessageModal?.(
      "Success!",
      data?.message || "Password changed successfully"
    );
    return { success: true, message: data?.message };
  } catch (err) {
    showMessageModal?.("Oops!", "Something went wrong");
    return { success: false, message: "Network error" };
  }
}

export async function deleteAccount(userId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Oops!", msg || "Failed to delete account.");
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    showMessageModal?.("Oops!", "Failed to delete account.");
    return { success: false };
  }
}

export async function addFavorite(userId, dramaId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dramaId),
      credentials: "include",
    });
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Oops!", msg || "Failed to add favorite.");
      return null;
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Failed to add favorite.");
    return null;
  }
}

export async function removeFavorite(userId, dramaId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/favorites/${dramaId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Oops!", msg || "Failed to remove favorite.");
      return null;
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Failed to remove favorite.");
    return null;
  }
}

export async function loadAllFavorites(userId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/favorites/details`);
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Error", msg || "Unable to load favorite dramas.");
      return { results: [], totalPages: 0 };
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to load favorite dramas.");
    return { results: [], totalPages: 0 };
  }
}

export async function addWatch(userId, dramaId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dramaId),
      credentials: "include",
    });
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Oops!", msg || "Failed to add to watchlist.");
      return null;
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Failed to add to watchlist.");
    return null;
  }
}

export async function removeWatch(userId, dramaId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/watchlist/${dramaId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Oops!", msg || "Failed to remove from watchlist.");
      return null;
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Failed to remove from watchlist.");
    return null;
  }
}

export async function loadAllWatches(userId, showMessageModal) {
  try {
    const res = await fetch(`${BACKEND_URL}/${userId}/watchlist/details`);
    if (!res.ok) {
      const msg = await res.text();
      showMessageModal?.("Error", msg || "Unable to load watchlist.");
      return { results: [], totalPages: 0 };
    }
    return res.json();
  } catch (err) {
    showMessageModal?.("Oops!", "Unable to load watchlist.");
    return { results: [], totalPages: 0 };
  }
}

export const getAiRecommendation = async ({ genre, length, mood, gems }) => {
  try {
    const response = await fetch(`https://localhost:7147/api/ai/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ genre, length, mood, gems }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to fetch AI recommendation");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching AI recommendation:", error);
    return null;
  }
};
