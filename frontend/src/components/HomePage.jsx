import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../api";
import ProductCard from "./ProductCard";

const CATEGORY_ICONS = {
  electronics: "💻",
  clothing: "👕",
  books: "📚",
  "home-kitchen": "🏠",
  "sports-outdoors": "⚽",
  "beauty-personal-care": "💄",
  "toys-games": "🧩",
  groceries: "🛒",
};

const styles = {
  hero: {
    background: "linear-gradient(135deg, #4c51bf 0%, #4299e1 55%, #38b2ac 100%)",
    padding: "3rem 1rem 2.5rem",
    textAlign: "center",
    color: "#fff",
  },
  heroTitle: { fontSize: "2.25rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em" },
  heroSubtitle: {
    fontSize: "1.05rem", opacity: 0.92, marginTop: "0.5rem",
    maxWidth: "560px", marginLeft: "auto", marginRight: "auto",
  },
  page: { maxWidth: "1200px", margin: "0 auto", padding: "0 1rem 2rem" },
  pillBar: { display: "flex", gap: "0.6rem", overflowX: "auto", padding: "1.5rem 0 1.75rem", marginBottom: "0.5rem" },
  pill: {
    display: "flex", alignItems: "center", gap: "0.4rem",
    padding: "0.55rem 1.1rem", borderRadius: "999px",
    border: "1px solid #e2e8f0", background: "#fff",
    fontSize: "0.88rem", fontWeight: "600", color: "#4a5568",
    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
    transition: "all 0.15s",
  },
  pillActive: { background: "#2d3748", color: "#fff", border: "1px solid #2d3748" },
  header: { marginBottom: "1.25rem", marginTop: "0.5rem" },
  title: { fontSize: "1.6rem", fontWeight: "700", color: "#1a202c" },
  subtitle: { color: "#718096", marginTop: "0.2rem", fontSize: "0.92rem" },
  toolbar: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center", justifyContent: "flex-end" },
  select: { padding: "0.5rem 0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.88rem", background: "#fff", cursor: "pointer", color: "#2d3748" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" },
  pagination: { display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2.5rem" },
  pageBtn: { padding: "0.45rem 0.95rem", border: "1px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", background: "#fff", fontSize: "0.9rem", fontWeight: "600", color: "#4a5568" },
  pageBtnActive: { background: "#4299e1", color: "#fff", border: "1px solid #4299e1" },
  empty: { textAlign: "center", padding: "4rem", color: "#718096" },
  error: { background: "#fed7d7", color: "#c53030", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem", fontWeight: "500" },
  loading: { textAlign: "center", padding: "4rem", color: "#718096", fontSize: "1.05rem" },
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [category, setCategory] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const pageSize = 12;
  const totalPages = Math.ceil(count / pageSize);

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = { page, ordering };
    if (search) params.search = search;
    if (category) params.category = category;

    getProducts(params)
      .then((res) => {
        setProducts(res.data.results);
        setCount(res.data.count);
      })
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false));
  }, [page, search, category, ordering]);

  useEffect(() => { setPage(1); }, [search, category, ordering]);

  return (
    <>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Everything you need, all in one place</h1>
        <p style={styles.heroSubtitle}>
          Browse electronics, fashion, home goods and more — new arrivals added every week.
        </p>
      </div>

      <div style={styles.page}>
        <div style={styles.pillBar}>
          <button style={{ ...styles.pill, ...(category === "" ? styles.pillActive : {}) }} onClick={() => setCategory("")}>
            ✨ All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              style={{ ...styles.pill, ...(category === c.slug ? styles.pillActive : {}) }}
              onClick={() => setCategory(c.slug)}
            >
              <span>{CATEGORY_ICONS[c.slug] || "🏷️"}</span> {c.name}
            </button>
          ))}
        </div>

        <div style={styles.header}>
          <h2 style={styles.title}>{search ? `Results for "${search}"` : "All Products"}</h2>
          <p style={styles.subtitle}>{count} product{count !== 1 ? "s" : ""} found</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.toolbar}>
          <select style={styles.select} value={ordering} onChange={(e) => setOrdering(e.target.value)} aria-label="Sort products">
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "3rem" }}>🔍</p>
            <p>No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
