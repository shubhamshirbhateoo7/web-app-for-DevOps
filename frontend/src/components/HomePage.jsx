import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../api";
import ProductCard from "./ProductCard";

const styles = {
  page: { maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" },
  header: { marginBottom: "1.5rem" },
  title: { fontSize: "1.75rem", fontWeight: "700", color: "#2d3748" },
  subtitle: { color: "#718096", marginTop: "0.25rem" },
  toolbar: {
    display: "flex", gap: "1rem", flexWrap: "wrap",
    marginBottom: "1.5rem", alignItems: "center",
  },
  select: {
    padding: "0.45rem 0.75rem", borderRadius: "6px",
    border: "1px solid #e2e8f0", fontSize: "0.9rem",
    background: "#fff", cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1.5rem",
  },
  pagination: {
    display: "flex", justifyContent: "center",
    gap: "0.5rem", marginTop: "2rem",
  },
  pageBtn: {
    padding: "0.4rem 0.9rem", border: "1px solid #e2e8f0",
    borderRadius: "6px", cursor: "pointer", background: "#fff",
    fontSize: "0.9rem",
  },
  pageBtnActive: {
    background: "#4299e1", color: "#fff",
    border: "1px solid #4299e1",
  },
  empty: { textAlign: "center", padding: "4rem", color: "#718096" },
  error: {
    background: "#fed7d7", color: "#c53030", padding: "1rem",
    borderRadius: "8px", marginBottom: "1rem",
  },
  loading: { textAlign: "center", padding: "4rem", color: "#718096", fontSize: "1.1rem" },
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
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
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

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, ordering]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {search ? `Results for "${search}"` : "All Products"}
        </h1>
        <p style={styles.subtitle}>{count} product{count !== 1 ? "s" : ""} found</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.toolbar}>
        <select
          style={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select
          style={styles.select}
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          aria-label="Sort products"
        >
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
  );
}
