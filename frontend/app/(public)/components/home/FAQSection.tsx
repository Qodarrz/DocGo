import { useState, useRef } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: "Bagaimana cara mendaftar sebagai penyelenggara event?",
    answer:
      "Anda dapat mendaftar dengan mengklik tombol 'Daftar' di pojok kanan atas, mengisi formulir pendaftaran, dan verifikasi email. Setelah itu, Anda dapat langsung membuat event pertama Anda."
  },
  {
    question: "Bagaimana sistem sertifikat digital bekerja?",
    answer:
      "Setelah event selesai, sistem akan secara otomatis menghasilkan sertifikat untuk peserta yang telah hadir. Sertifikat dapat diunduh langsung dari dashboard peserta atau dikirim via email."
  },
  {
    question: "Apakah data peserta aman?",
    answer:
      "Keamanan data adalah prioritas kami. Semua data dienkripsi dan dilindungi dengan protokol keamanan tingkat enterprise. Kami juga mematuhi peraturan perlindungan data yang berlaku."
  },
  {
    question: "Apakah NeoWest mendukung event online dan offline?",
    answer:
      "Ya, NeoWest mendukung pengelolaan event baik secara online maupun offline dengan fitur check-in, pendaftaran, dan sertifikasi digital yang fleksibel."
  },
  {
    question: "Bisakah saya mengekspor data peserta?",
    answer:
      "Tentu, Anda dapat mengekspor data peserta dalam format CSV atau Excel langsung dari dashboard untuk analisis lebih lanjut."
  },
  {
    question: "Apakah ada batasan jumlah event yang bisa dibuat?",
    answer:
      "Tidak ada batasan jumlah event yang bisa Anda buat. Anda dapat mengelola banyak event sekaligus sesuai paket langganan Anda."
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-10 bg-white fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Pertanyaan Umum
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Temukan jawaban untuk pertanyaan yang sering diajukan tentang NeoWest.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex justify-between items-center text-left text-gray-900 font-medium focus:outline-none"
              >
                <span>{item.question}</span>
                {activeIndex === index ? (
                  <FaChevronUp className="ml-2 text-gray-600 transition-transform duration-300" />
                ) : (
                  <FaChevronDown className="ml-2 text-gray-600 transition-transform duration-300" />
                )}
              </button>

              <div
                ref={(el: HTMLDivElement | null) => {
                  contentRefs.current[index] = el; // ✅ hanya set, tidak return apa-apa
                }}


                style={{
                  maxHeight: activeIndex === index ? `${contentRefs.current[index]?.scrollHeight}px` : "0px",
                  opacity: activeIndex === index ? 1 : 0,
                  transform: activeIndex === index ? "scaleY(1)" : "scaleY(0)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  transformOrigin: "top",
                  overflow: "hidden",
                }}
                className="mt-2 text-gray-600"
              >
                <p>{item.answer}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
