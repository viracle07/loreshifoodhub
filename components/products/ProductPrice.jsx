export default function ProductPrice({
  price,
  packageLabel,
}) {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="text-lg font-bold text-[#1F1F1F]">
        {formattedPrice}
      </span>

      {packageLabel ? (
        <span className="text-xs text-gray-500">
          / {packageLabel}
        </span>
      ) : null}
    </div>
  );
}