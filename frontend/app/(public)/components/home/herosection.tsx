import { FlipWords } from "@/components/ui/flip-words";

const words = ["Reliable", "Innovative", "Trusted", "Professional"];

export default function HeroSection() {
  return (
    <main className="relative min-h-screen w-full pt-20 md:pt-10 px-20 bg-background text-foreground py-12">
      {/* Decorative Icons */}
      <div className="absolute top-10 left-10 opacity-10 text-6xl">+</div>
      <div className="absolute bottom-20 right-20 opacity-10 text-6xl">+</div>

      {/* Dot Patterns */}
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-5 bg-[radial-gradient(circle,var(--color-white)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 bg-[radial-gradient(circle,var(--color-white)_1px,transparent_1px)] bg-[length:20px_20px]"></div>

      {/* Circular Outline */}
      <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-96 h-96 border border-foreground/10 rounded-full"></div>

      {/* Main Container */}
      <div className="container mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div className="space-y-8">
            <div className="text-2xl md:text-5xl mx-auto text-primary-light font-bold leading-tight">
              Dedicated to
              <FlipWords
                className="text-foreground dark:text-white font-bold"
                words={words}
              />{" "}
              <br />
              Medical Excellence Patient
            </div>

            <p className="text-sm md:text-lg max-w-lg">
              Kami menyediakan layanan kesehatan modern dengan standar
              profesional, memastikan setiap pasien mendapatkan perawatan
              terbaik, akurat, dan berbasis evidensi.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-primary text-background dark:text-foreground px-8 py-3 rounded-full font-medium hover:bg-primary-light transition">
                Pelajari Lebih Lanjut
              </button>
              <button className="border border-foreground/30 text-foreground px-8 py-3 rounded-full font-medium hover:bg-foreground/10 transition">
                Hubungi Kami
              </button>
            </div>
          </div>

          {/* Right Section (Image) */}
          <div className="relative pb-5 flex justify-center lg:justify-end">
            <img
              src="images/hersec.png"
              alt="Doctor or Medical Team"
              className="scale-100"
            />
            {/* Overlay gradasi putih dari bawah ke atas */}
            <div className="absolute inset-1 bg-gradient-to-t from-white to-transparent dark:from-background to-transparent"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
