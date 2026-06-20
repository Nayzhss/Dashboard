import Image from "next/image"
import { SHOPS, getShopScore } from "./data/shops"

const sortedShops = [...SHOPS].sort(
  (a, b) => getShopScore(b) - getShopScore(a)
)

const featured = sortedShops[0]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b10] text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/5">
        <h1 className="font-semibold">Boutiques</h1>

        <a
          href="/dashboard"
          className="text-sm text-violet-300 hover:text-violet-200"
        >
          Dashboard
        </a>
      </header>

      {/* LAYOUT */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-6">

        {/* FEATURED */}
        <div className="lg:col-span-1">
          <p className="text-xs text-[#6b6b80] mb-3">
            Boutique du moment
          </p>

          <div className="bg-[#16161f] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition">

            <Image
              src={`/logo/${featured.slug}.png`}
              alt={featured.name}
              width={80}
              height={80}
              className="rounded-xl mb-4"
            />

            <h2 className="text-lg font-semibold">
              {featured.name}
            </h2>

            <p className="text-sm text-[#6b6b80] mt-1">
              {featured.website}
            </p>

            <p className="text-xs text-[#6b6b80] mt-2">
              Methods: {featured.methods.length}
            </p>

            <button className="mt-4 w-full bg-violet-600 hover:bg-violet-500 rounded-xl py-2 text-sm">
              Voir la boutique
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="lg:col-span-2">
          <p className="text-xs text-[#6b6b80] mb-3">
            Toutes les boutiques
          </p>

          <div className="grid sm:grid-cols-2 gap-4">

            {sortedShops.map((shop) => (
              <div
                key={shop.slug}
                className="bg-[#16161f] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition cursor-pointer"
              >

                <div className="flex items-center gap-3">

                  <Image
                    src={`/logo/${shop.slug}.png`}
                    alt={shop.name}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />

                  <div>
                    <p className="font-medium">
                      {shop.name}
                    </p>

                    <p className="text-xs text-[#6b6b80]">
                      {shop.website}
                    </p>
                  </div>

                </div>

                <div className="mt-3 text-xs text-[#6b6b80] space-y-1">
                  <p>🔥 Score: {Math.round(getShopScore(shop))}</p>
                  <p>🧠 Methods: {shop.methods.length}</p>
                  <p>🚚 Delivery: {shop.shipping.delivery.join(", ")}</p>
                </div>

                <button className="mt-4 text-xs text-violet-300 hover:text-violet-200">
                  Ouvrir →
                </button>

              </div>
            ))}

          </div>
        </div>

      </div>
    </main>
  )
}