import HeroSection from "@/app/(public)/components/home/herosection";
import { About } from "@/app/(public)/components/home/about";
import TestimonialsSection from "@/app/(public)/components/home/TestimonialsSection";

const dummyTestimonials = [
  {
    name: "Diana Putri",
    role: "Event Organizer",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    content:
      "NeoWest sangat memudahkan kami dalam mengelola event dari awal hingga akhir. Fitur token kehadiran dan sertifikat otomatis sangat membantu!"
  },
  {
    name: "Rizky Pratama",
    role: "Project Manager",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    content:
      "Platform ini membuat koordinasi tim jauh lebih efisien. Semua data peserta dan laporan event tersaji dengan rapi."
  },
  {
    name: "Siti Aisyah",
    role: "HR Development",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content:
      "Kami menggunakan NeoWest untuk pelatihan internal. Proses registrasi hingga absensi berjalan lancar tanpa kendala."
  },
  {
    name: "Andi Saputra",
    role: "Community Lead",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    content:
      "UI-nya intuitif dan mudah dipahami. Peserta event kami juga memberikan feedback yang sangat positif."
  },
  {
    name: "Maya Lestari",
    role: "Marketing Specialist",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    content:
      "Fitur tracking peserta dan laporan statistik sangat membantu evaluasi event secara data-driven."
  },
  {
    name: "Budi Santoso",
    role: "Startup Founder",
    image: "https://randomuser.me/api/portraits/men/60.jpg",
    content:
      "NeoWest mempercepat proses operasional event kami. Sangat cocok untuk skala kecil maupun besar."
  }
];


export default function HomePage() {
  return (
    
    <div className="overflow-hidden">
      <HeroSection />


      <About />
      <TestimonialsSection testimonials={dummyTestimonials} />

    </div>
  );
}
