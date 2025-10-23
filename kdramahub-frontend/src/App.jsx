import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/index";
import { Favorites } from "./pages/favorites";
import { AIRecommend } from "./pages/airecommend";
import { DramaPage } from "./components/DramaPage";
import { UserModal } from "./components/UserModal";
import { useModal } from "./context/ModalContext";
import { MessageModal } from "./components/MessageModal";
import { AccountInfo } from "./components/AccountInfo";
import { Watchlist } from "./pages/watchlist";
import "./App.css";

function App() {
  const { showUserModal, showAccountInfo } = useModal();
  const { messageModalContent } = useModal();

  return (
    <div className="page-wrapper">
      {messageModalContent && (
        <MessageModal
          heading={messageModalContent.heading}
          msg={messageModalContent.msg}
          special={messageModalContent.special}
        />
      )}
      <Navbar />
      {showUserModal && <UserModal />}
      {showAccountInfo && <AccountInfo />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/ai-recommend" element={<AIRecommend />} />
          <Route path="/drama/:id" element={<DramaPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
