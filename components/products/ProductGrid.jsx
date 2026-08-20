import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
}) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D9D5C9] bg-[#FAF9F5] px-6 py-12 text-center">
        <h3 className="text-lg font-semibold text-[#1F1F1F]">
          No products available yet
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          New products will appear here soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}