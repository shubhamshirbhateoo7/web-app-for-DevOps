import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const styles = {
  nav: {
    background: "#1a202c", padding: "0 2rem", display: "flex",
    alignItems: "center", justifyContent: "space-between",
    height: "64px", boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
    position: "sticky", top: 0, zIndex: 10,
  },
  brand: { color: "#fff", fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px", textDecoration: "none" },
  form: { display: "flex", gap: "0.5rem" },
  input: {
    padding: "0.5rem 0.9rem", borderRadius: "999px", border: "1px solid transparent",
    fontSize: "0.9rem", width: "240px", outline: "none", background: "#2d3748", color: "#fff",
  },
  btn: {
    padding: "0.5rem 1.25rem", background: "linear-gradient(135deg, #4299e1, #38b2ac)",
    color: "#fff", border: "none", borderRadius: "999px", cursor: "pointer",
    fontSize: "0.9rem", fontWeight: "600",
  },
};

export default function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query.trim())}`);
    else navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🛒 ShopApp</Link>
      <form onSubmit={handleSearch} style={styles.form}>
        <input style={styles.input} placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search products" />
        <button style={styles.btn} type="submit">Search</button>
      </form>
    </nav>
  );
}
