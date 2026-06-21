import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AnimePage from "./pages/AnimePage";
import WatchPage from "./pages/WatchPage";
import WikiPage from "./pages/WikiPage";
import WikiDetailPage from "./pages/WikiDetailPage";
import RankingsPage from "./pages/RankingsPage";
import DownloadsPage from "./pages/DownloadsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-surface">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/anime" element={<AnimePage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/wiki" element={<WikiPage />} />
              <Route path="/wiki/:id" element={<WikiDetailPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="/downloads" element={<DownloadsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
