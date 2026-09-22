import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ProductCard from "./ProductCard";

const mockProduct = {
  id: 1,
  name: "Test Laptop",
  slug: "test-laptop",
  description: "A great laptop for testing",
  price: "999.99",
  stock: 10,
  image_url: null,
  category_name: "Electronics",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
    expect(screen.getByText("Test Laptop")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
    expect(screen.getByText("$999.99")).toBeInTheDocument();
  });

  it("renders in stock label", () => {
    render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
    expect(screen.getByText("10 in stock")).toBeInTheDocument();
  });

  it("renders out of stock for zero stock", () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...mockProduct, stock: 0 }} />
      </MemoryRouter>
    );
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("links to product detail page", () => {
    render(<MemoryRouter><ProductCard product={mockProduct} /></MemoryRouter>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/test-laptop");
  });
});
