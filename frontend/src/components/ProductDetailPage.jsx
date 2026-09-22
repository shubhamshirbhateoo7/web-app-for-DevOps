import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProduct } from "../api";

const styles = {
  page: { maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem" },
  back: {
    display: "inline-flex", alignItems: "center", gap: "0.4rem",
    color: "#4299e1", marginBottom: "1.5rem", fontSize: "0.9rem",
    fontWeight: "600",
  },
  card: {
    background: "#fff", borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden", display: "flex", flexWrap: "wrap",
  },
  img: { width: "100%", maxWidth: "420px", objectFit: "cover", background: "#edf2f7" },
  placeholder: {
    width: "420px", minHeight: "320px", background: "#edf2f7",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "5rem", color: "#a0aec0",
  },
  info: { flex: 1, padding: "2rem", minWidth: "260px" },
  category: {
    fontSize: "0.75rem", color: "#4299e1",
    textTransform: "uppercase", fontWeight: "600",
    letterSpacing: "0.05em", marginBottom: "0.5rem",
  },
  name: { fontSize: "1.6rem", fontWeight: "700", color: "#2d3748", marginBottom: "1rem" },
  price: { fontSize: "2rem", fontWeight: "700", color: "#2d3748", marginBottom: "1rem" },
  desc: { color: "#4a5568", lineHeight: "1.7", marginBottom: "1.5rem" },
  badge: {
    display: "inline-block", padding: "0.3rem 0.75rem",
    borderRadius: "999px", fontSize: "0.85rem", fontWeight: "600",
    marginBottom: "1.5rem",
  },
  inStock: { background: "#c6f6d5", color: "#276749" },
  outOfStock: { background: "#fed7d7", color: "#c53030" },
  loading: { textAlign: "center", padding: "4rem", color: "#718096" },
  error: { textAlign: "center", padding: "4rem", color: "#c53030" },
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={styles.loading}>Loading product...</div>;
  if (error) return (
    <div style={styles.page}>
      <div style={styles.error}>{error}</div>
      <Link to="/" style={styles.back}>← Back to products</Link>
    </div>
  );

  return (
    <div style={styles.page}>
      <Link to="/" style={styles.back}>← Back to products</Link>
      <div style={styles.card}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={styles.img} />
        ) : (
          <div style={styles.placeholder} aria-hidden="true">🛍️</div>
        )}
        <div style={styles.info}>
          {product.category_name && (
            <div style={styles.category}>{product.category_name}</div>
          )}
          <h1 style={styles.name}>{product.name}</h1>
          <div style={styles.price}>${parseFloat(product.price).toFixed(2)}</div>
          <span style={{ ...styles.badge, ...(product.stock > 0 ? styles.inStock : styles.outOfStock) }}>
            {product.stock > 0 ? `✓ ${product.stock} in stock` : "✗ Out of stock"}
          </span>
          <p style={styles.desc}>{product.description}</p>
        </div>
      </div>
    </div>
  );
}
