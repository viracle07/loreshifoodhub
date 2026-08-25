import {
  MessageCircle,
  Quote,
  Heart,
} from "lucide-react";

const reviews = [
  {
    product: "Dried Catfish",
    text: "Am so impressed with this dried catfish. It is tasty, crispy and well prepared. Infact it barely made it to my pot of soup cos I nearly finished eating them as snack.",
  },
  {
    product: "Meat & Kilishi",
    text: "Just to let you know ma. we all loved our orders.. the meats were well seasoned and spiced. And the kilishi is 💯 Thank you so much ma",
  },
  {
    product: "Beans",
    text: "Goodevening Anty Abeni, just cooking my beans... I loveeeeeeeeeee it😍. More sales to Loreshi lase Edumare 🙏",
  },
];

export default function CustomerReviews() {
  return (
    <section className="border-y border-[#E7E4DC] bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EDF4E4]">
            <MessageCircle
              size={21}
              className="text-[#68912B]"
            />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#B22625]">
            Customer Feedback
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1F1F1F] sm:text-4xl">
            What our customers say
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            Real feedback from customers who have
            experienced Loreshi FoodHub.
          </p>
        </div>

        {/* REVIEWS */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((review, index) => (
            <article
              key={index}
              className="relative flex h-full flex-col rounded-3xl border border-[#E7E4DC] bg-[#FFFDF8] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-7"
            >
              {/* QUOTE ICON */}
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF4E4]">
                <Quote
                  size={17}
                  className="text-[#68912B]"
                />
              </div>

              {/* PRODUCT */}
              <div className="pr-12">
                <span className="inline-flex rounded-full bg-[#F5F3EC] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#68912B]">
                  {review.product}
                </span>
              </div>

              {/* REVIEW */}
              <p className="mt-6 flex-1 text-sm leading-7 text-gray-600 sm:text-base">
                “{review.text}”
              </p>

              {/* CUSTOMER */}
              <div className="mt-7 flex items-center gap-3 border-t border-[#E7E4DC] pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDF4E4]">
                  <Heart
                    size={17}
                    className="text-[#B22625]"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#1F1F1F]">
                    Loreshi Customer
                  </p>

                  <p className="text-xs text-gray-400">
                    Customer feedback
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* TRUST MESSAGE */}
        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-xs text-gray-500 sm:text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#68912B]" />
          <span>
            Your satisfaction is at the heart of what we do.
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#B22625]" />
        </div>
      </div>
    </section>
  );
}