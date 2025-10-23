import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  const openUserModal = () => setShowUserModal(true);
  const closeUserModal = () => setShowUserModal(false);

  const openAccountInfo = () => setShowAccountInfo(true);
  const closeAccountInfo = () => setShowAccountInfo(false);

  const [messageModalContent, setMessageModalContent] = useState(null);

  const showMessageModal = (heading, msg, special = false) => {
    setMessageModalContent({ heading, msg, special });
  };

  return (
    <ModalContext.Provider
      value={{
        showUserModal,
        openUserModal,
        closeUserModal,
        showAccountInfo,
        openAccountInfo,
        closeAccountInfo,
        messageModalContent,
        setMessageModalContent,
        showMessageModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
