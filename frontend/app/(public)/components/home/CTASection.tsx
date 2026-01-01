import { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaWhatsapp } from 'react-icons/fa';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="py-16 fade-in bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <h2 className="text-3xl font-extrabold text-black sm:text-4xl">
            Hubungi Kami
          </h2>
          <p className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto">
            Punya pertanyaan atau butuh bantuan? Tim kami siap membantu Anda dalam perjalanan event management Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="hidden lg:flex relative space-y-8">
            <div className="w-full -mt-20 relative"> {/* geser ke atas dengan -mt-20 */}
              <img
                src="/loresass/ilus.png"
                alt="Informasi Kontak"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay di bawah */}
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8">
            <h3 className="text-2xl font-bold text-black mb-6">Kirim Pesan</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B3483] focus:border-[#4B3483] transition-colors duration-300"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B3483] focus:border-[#4B3483] transition-colors duration-300"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B3483] focus:border-[#4B3483] transition-colors duration-300"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#4B3483] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#3A2766] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <FaPaperPlane className="mr-2" />
                Kirim Pesan
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                Atau email kami langsung di{" "}
                <a href="mailto:neowestfnb@gmail.com" className="text-[#4B3483] font-medium hover:text-[#3A2766]">
                  neowestfnb@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}