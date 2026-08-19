export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFDF8]">
      <section className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-6">
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDF4E4]">
            <span className="text-2xl" aria-hidden="true">
              🍎
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#68912B]">
            Loreshi FoodHub
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#1F1F1F] sm:text-5xl lg:text-6xl">
            Quality foodstuff.
            <br />
            <span className="text-[#B22625]">Smiles served daily.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            A modern foodstuff marketplace for quality garri, oil, fish,
            groundnuts and other everyday food items.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <div className="rounded-full bg-[#B22625] px-6 py-3 text-sm font-semibold text-white">
              Loreshi is coming together
            </div>

            <div className="rounded-full border border-[#E7E4DC] bg-white px-6 py-3 text-sm font-semibold text-[#68912B]">
              Milestone 1
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}