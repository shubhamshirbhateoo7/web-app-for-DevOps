import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import ProductDetailPage from "./components/ProductDetailPage";
import NotFoundPage from "./components/NotFoundPage";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer style={{
        background: "#2d3748", color: "#a0aec0",
        textAlign: "center", padding: "1.5rem",
        fontSize: "0.875rem"
      }}>
        © {new Date().getFullYear()} ShopApp — Deployed on AWS
      </footer>
    </div>
  );
}
