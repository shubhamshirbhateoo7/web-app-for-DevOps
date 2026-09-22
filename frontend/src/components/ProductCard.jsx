import { Link } from "react-router-dom";

const styles = {
  card: {
    background: "#fff", borderRadius: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
    cursor: "pointer",
  },
  img: {
    width: "100%", height: "200px", objectFit: "cover",
    background: "#edf2f7",
  },
  placeholder: {
    width: "100%", height: "200px", background: "#edf2f7",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "3rem", color: "#a0aec0",
  },
  body: { padding: "1rem" },
  category: {
    fontSize: "0.75rem", color: "#4299e1",
    textTransform: "uppercase", fontWeight: "600",
    letterSpacing: "0.05em", marginBottom: "0.25rem",
  },
  name: {
    fontSize: "1rem", fontWeight: "700", color: "#2d3748",
    marginBottom: "0.5rem", lineHeight: "1.3",
  },
  desc: {
    fontSize: "0.85rem", color: "#718096",
    marginBottom: "1rem", lineHeight: "1.5",
    display: "-webkit-box", WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: "1.2rem", fontWeight: "700", color: "#2d3748" },
  stock: { fontSize: "0.8rem", color: "#48bb78", fontWeight: "600" },
  outOfStock: { fontSize: "0.8rem", color: "#fc8181", fontWeight: "600" },
};

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      style={{ textDecoration: "none" }}
      aria-label={`View ${product.name}`}
    >
      <div
        style={styles.card}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";
        }}
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={styles.img} loading="lazy" />
        ) : (
          <div style={styles.placeholder} aria-hidden="true">🛍️</div>
        )}
        <div style={styles.body}>
          {product.category_name && (
            <div style={styles.category}>{product.category_name}</div>
          )}
          <div style={styles.name}>{product.name}</div>
          <div style={styles.desc}>{product.description}</div>
          <div style={styles.footer}>
            <span style={styles.price}>${parseFloat(product.price).toFixed(2)}</span>
            <span style={product.stock > 0 ? styles.stock : styles.outOfStock}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
