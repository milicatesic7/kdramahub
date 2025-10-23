import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userLogged, setUserLogged] = useState(false);
  const [userData, setUserData] = useState(null);

  const loginUser = (user) => {
    setUserLogged(true);
    setUserData({
      ...user,
      favorites: user.favorites || [],
      watchlist: user.watchlist || [],
    });
  };

  const logoutUser = () => {
    setUserLogged(false);
    setUserData(null);
  };

  return (
    <UserContext.Provider
      value={{
        userLogged,
        userData,
        setUserLogged,
        setUserData,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
