import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
      <div style={{ fontSize: "4rem" }}>404</div>
      <h2 style={{ fontSize: "1.5rem", color: "#2d3748", margin: "1rem 0" }}>
        Page not found
      </h2>
      <p style={{ color: "#718096", marginBottom: "2rem" }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          background: "#4299e1", color: "#fff",
          padding: "0.6rem 1.5rem", borderRadius: "8px",
          fontWeight: "600",
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
