import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const styles = {
  nav: {
    background: "#2d3748",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  brand: { color: "#fff", fontSize: "1.4rem", fontWeight: "700", letterSpacing: "-0.5px" },
  form: { display: "flex", gap: "0.5rem" },
  input: {
    padding: "0.4rem 0.75rem", borderRadius: "6px",
    border: "none", fontSize: "0.9rem", width: "220px",
    outline: "none",
  },
  btn: {
    padding: "0.4rem 1rem", background: "#4299e1",
    color: "#fff", border: "none", borderRadius: "6px",
    cursor: "pointer", fontSize: "0.9rem",
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
        <input
          style={styles.input}
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <button style={styles.btn} type="submit">Search</button>
      </form>
    </nav>
  );
}
