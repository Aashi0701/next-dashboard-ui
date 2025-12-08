"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import LoginModal from "@/components/LoginModal";
import { useUser } from "@clerk/nextjs";
import SessionLoader from "@/components/SessionLoader";

// Zod Schema Validation
const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormData = z.infer<typeof ContactSchema>;

export default function HomePage() {
  /* ✅ ALL HOOKS FIRST — NO RETURNS ABOVE */

  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { isLoaded, isSignedIn } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
  });

  const taglines = [
    "Nurturing Minds",
    "Inspiring Hearts",
    "Building Futures",
  ];

  const images = [
    "gallery1.png",
    "gallery2.jpg",
    "gallery3.jpg",
    "gallery4.jpg",
  ];

  /* ✅ EFFECTS */

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  /* ✅ HANDLERS */

  const onSubmit = (data: ContactFormData) => {
    alert("Message sent successfully!");
    reset();
  };

  /* ✅ SAFE CONDITIONAL RENDER — AFTER ALL HOOKS */

  if (!isLoaded) {
    return <SessionLoader />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-rose-50 text-gray-800 font-sans">
      {/* 🌟 Responsive Navbar */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Image
            src="/my_logo.png"
            alt="TrueSunshine Logo"
            width={45}
            height={45}
            className="rounded-full"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-amber-700">
            TrueSunshine
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="#about" className="hover:text-amber-600 transition">
            About
          </Link>
          <Link href="#mission" className="hover:text-amber-600 transition">
            Mission & Vision
          </Link>
          <Link href="#admissions" className="hover:text-amber-600 transition">
            Admissions
          </Link>
          <Link href="#gallery" className="hover:text-amber-600 transition">
            Gallery
          </Link>
          <Link href="#contact" className="hover:text-amber-600 transition">
            Contact
          </Link>
          <button
            onClick={() => setLoginOpen(true)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6 text-amber-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-4 flex flex-col space-y-3 md:hidden border border-gray-100 w-48 text-sm">
            <Link href="#about" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link href="#mission" onClick={() => setMenuOpen(false)}>
              Mission & Vision
            </Link>
            <Link href="#admissions" onClick={() => setMenuOpen(false)}>
              Admissions
            </Link>
            <Link href="#gallery" onClick={() => setMenuOpen(false)}>
              Gallery
            </Link>
            <Link href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            <button
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
            >
              Login
            </button>
          </div>
        )}
      </nav>

      {/* 🌞 Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-25 sm:py-20 overflow-hidden bg-[url('/gallery1.png')] bg-cover bg-center">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-amber-50/70 to-rose-50/80 backdrop-blur-sm" />

        {/* Floating Ambient Blobs */}
        <div className="absolute -top-32 -left-20 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl animate-pulse-slow" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl animate-fade-in-up">
          <Image
            src="/my_logo.png"
            alt="TrueSunshine Montessori Logo"
            width={140}
            height={140}
            className="mb-6 mx-auto drop-shadow-md"
          />

          {/* Animated Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-amber-800 mb-4 leading-tight transition-all duration-700">
            <span className="block animate-fade-in-up">{taglines[index]}</span>
          </h1>

          {/* Decorative Divider */}
          <div className="mx-auto w-24 h-1 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full mb-6"></div>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
            TrueSunshine Montessori helps children learn with love, freedom, and
            curiosity — fostering independence and joy in every little discovery.
          </p>

          {/* Animated Call-To-Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delayed">
            <button
              onClick={() => setLoginOpen(true)}
              className="group px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg shadow-md text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                Explore Programs →
              </span>
            </button>

            <Link
              href="#contact"
              className="group px-8 py-3 border border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg shadow-sm text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                Contact Us →
              </span>
            </Link>
          </div>

        </div>
      </section>

      {/* 🏫 About Section */}
      <section
        id="about"
        className="relative bg-gradient-to-b from-white to-white py-20 px-6 sm:px-12 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-14">

          {/* Left — About Text */}
          <div className="flex-1 text-center md:text-left animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-800 mb-3">
              About TrueSunshine Preschool
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-rose-400 rounded-full mx-auto md:mx-0 mb-6"></div>

            <p className="text-gray-600 leading-relaxed text-base sm:text-lg mb-5">
              At <span className="font-semibold text-amber-700">TrueSunshine Preschool</span>,
              we nurture every child’s natural curiosity and independence through hands-on exploration
              and purposeful play. Our classrooms are designed to inspire creativity, responsibility,
              and a lifelong love for learning.
            </p>

            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              Guided by the Montessori philosophy, we help children grow not just academically —
              but emotionally and socially — in a calm, caring, and stimulating environment that
              celebrates individuality and joy.
            </p>
          </div>

          {/* Right — Chairman Image + Message */}
          <div className="flex-1 animate-fade-in-delayed flex flex-col items-center text-center">

            {/* Image with glowing border */}
            <div className="p-1 rounded-full glowing-ring mb-6">
              <Image
                src="/alekhya.jpg"
                alt="Chairman"
                width={260}
                height={260}
                className="rounded-full shadow-md border-4 border-amber-200 object-cover"
              />
            </div>

            {/* Chairman Message */}
            <p className="leading-relaxed text-gray-700 text-lg mb-4 max-w-md">
              “Every child is a seed of possibility. At TrueSunshine, our goal is to nurture 
              that possibility with love, guidance, and meaningful experiences that empower 
              children to grow with confidence and compassion.”
            </p>

            <p className="italic text-amber-700 font-semibold text-lg">
              — Mrs. Alekhya Kumar V
              <br />
              <span className="text-gray-600 not-italic text-sm">
                Managing Director and Principal, TrueSunshine Preschool
              </span>
            </p>

          </div>

        </div>
      </section>

      {/* 🌈 Mission & Vision Section */}
      <section
        id="mission"
        className="relative py-20 px-6 sm:px-12 bg-gradient-to-b from-amber-50 to-white overflow-hidden"
      >
        {/* Ambient Background */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-rose-200/30 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-10 right-10 w-52 h-52 bg-amber-200/30 blur-3xl rounded-full"></div>

        <div className="relative max-w-6xl mx-auto text-center">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-800 mb-4 animate-fade-in-up">
            Our Mission & Vision
          </h3>
          <div className="mx-auto w-28 h-1 bg-gradient-to-r from-amber-500 to-rose-400 rounded-full mb-12"></div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Mission Card */}
            <div className="p-8 rounded-2xl bg-white shadow-md border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
              <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-amber-100 rounded-2xl shadow-inner">
                <Image
                  src="/mission.png"
                  alt="Mission Icon"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h4 className="text-2xl font-bold text-amber-700 mb-3">Our Mission</h4>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                To inspire self-motivated learners through the Montessori philosophy —
                cultivating independence, curiosity, empathy, and respect for
                themselves, others, and the environment.
              </p>
            </div>

            {/* Vision Card */}
            <div className="p-8 rounded-2xl bg-white shadow-md border border-rose-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-delayed">
              <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-rose-100 rounded-2xl shadow-inner">
                <Image
                  src="/vision.png"
                  alt="Vision Icon"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h4 className="text-2xl font-bold text-amber-700 mb-3">Our Vision</h4>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                To become a leading Montessori institution that nurtures confident,
                compassionate, and capable lifelong learners who create a positive
                impact on the world.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 📝 Admissions */}
      <section
        id="admissions"
        className="relative bg-white py-20 px-6 sm:px-12 text-center overflow-hidden"
      >
        {/* Soft Background Elements */}
        <div className="absolute -top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in-up">
          {/* Title */}
          <h3 className="text-3xl sm:text-4xl font-extrabold text-amber-800 mb-4">
            Admissions 2026–2027
          </h3>

          {/* Decorative Divider */}
          <div className="mx-auto w-32 h-1 bg-gradient-to-r from-rose-400 to-amber-500 rounded-full mb-8"></div>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed text-lg mb-10">
            Join the TrueSunshine Montessori family! Admissions now open for 
            <span className="font-semibold text-amber-700"> Pre-Montessori, Nursery, LKG, UKG, Grade-1 and Grade-2</span>.  
            Give your child a joyful, nurturing learning journey rooted in curiosity, independence, and compassion.
          </p>

          {/* Animated CTA Button */}
          <button
            onClick={() => setLoginOpen(true)}
            className="group inline-block px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl shadow-md text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
              Apply Now →
            </span>
          </button>
        </div>
      </section>

      {/* 🖼️ Gallery */}
      <section id="gallery" className="bg-amber-50 py-16 px-6 text-center">
      <h3 className="text-3xl font-semibold text-amber-700 mb-8">
        Gallery
      </h3>

      <div className="max-w-5xl mx-auto">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={20}
          loop={true}
          pagination={{ clickable: true }}
          navigation={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="rounded-xl"
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="overflow-hidden rounded-xl shadow-md hover:shadow-xl transition">
                <Image
                  src={`/${img}`}
                  alt={`Montessori Gallery ${i + 1}`}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      </section>

      {/* ☎️ Contact */}
      <section
        id="contact"
        className="relative bg-white py-20 px-6 sm:px-12 text-center overflow-hidden"
      >
        {/* Soft background shapes */}
        <div className="absolute -top-20 -left-16 w-60 h-60 bg-amber-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-100 rounded-full blur-3xl opacity-40" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Title */}
          <h3 className="text-3xl sm:text-4xl font-bold text-amber-700 mb-4">
            Contact Us
          </h3>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            We'd love to connect with you. Reach out for admissions, campus visits, or general queries.
          </p>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {/* Address */}
            <div className="bg-amber-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all animate-fade-in-up">
              <div className="text-amber-700 text-3xl mb-3">📍</div>
              <h4 className="font-semibold text-lg mb-2">Address</h4>
              <p className="text-gray-600">
                Mohan's Elite Appartments Khanamet, <br />
                Hyderabad Telangana-500084
              </p>
            </div>

            {/* Phone */}
            <div className="bg-rose-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all animate-fade-in-up">
              <div className="text-rose-600 text-3xl mb-3">📞</div>
              <h4 className="font-semibold text-lg mb-2">Phone</h4>
              <p className="text-gray-600">+91 79895 99833</p>
            </div>

            {/* Email */}
            <div className="bg-amber-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all animate-fade-in-up">
              <div className="text-amber-700 text-3xl mb-3">📧</div>
              <h4 className="font-semibold text-lg mb-2">Email</h4>
              <p className="text-gray-600">truesunshine.playschools@gmail.com</p>
            </div>
          </div>

          {/* Map + Contact Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            
            {/* Google Map Embed */}
            <div className="w-full h-72 rounded-xl overflow-hidden shadow-md animate-fade-in-up">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.97106829474!2d78.38164457414304!3d17.461098800679487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93d6209e0f0d%3A0x95c9fe94d6e83177!2sMohan&#39;s%20Elite%20Apartment!5e0!3m2!1sen!2sin!4v1763088792805!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            {/* Contact Form Section */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white p-8 rounded-xl shadow-md space-y-4 animate-fade-in-up"
            >
              <h4 className="text-lg font-semibold text-amber-700 mb-2">
                Send Us a Message
              </h4>

              {/* Name */}
              <div className="text-left">
                <input
                  type="text"
                  placeholder="Your Name"
                  {...register("name")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="text-left">
                <input
                  type="email"
                  placeholder="Your Email"
                  {...register("email")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Message */}
              <div className="text-left">
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  {...register("message")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 outline-none"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ⚓ Footer */}
      <footer className="bg-amber-700 text-white pt-12 pb-6 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-3">TrueSunshine</h3>
            <p className="text-amber-100 text-sm leading-relaxed">
              Nurturing curiosity, independence, and joyful learning through the
              Montessori way.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-amber-100 text-sm">
              <li><a href="#about" className="hover:text-white transition">About Us</a></li>
              <li><a href="#admissions" className="hover:text-white transition">Admissions</a></li>
              <li><a href="#gallery" className="hover:text-white transition">Gallery</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-amber-100 text-sm">
              <li>📍 Mohan's Elite Appartments Khanamet, Hyderabad Telangana-500084</li>
              <li>📞 +91 79895 99833</li>
              <li>📧 truesunshine.playschools@gmail.com</li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:scale-110 transition">
                <Image src="/facebook.png" alt="Facebook" width={26} height={26}/>
              </a>
              <a href="#" className="hover:scale-110 transition">
                <Image src="/instagram.png" alt="Instagram" width={26} height={26}/>
              </a>
              <a href="#" className="hover:scale-110 transition">
                <Image src="/youtube.png" alt="YouTube" width={26} height={26}/>
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-amber-500 mt-10 pt-4 text-center text-sm text-amber-100">
          © {new Date().getFullYear()} TrueSunshine Montessori — Growing Minds,  
          Shaping Futures 🌻
        </div>
      </footer>

      {/* 💬 Floating Contact Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-6 right-6 
          bg-green-500 hover:bg-green-600 
          text-white 
          w-12 h-12 
          rounded-full 
          flex items-center justify-center 
          shadow-xl 
          hover:scale-110 
          transition-all duration-300 
          animate-pulse-soft
        "
      >
        <Image
          src="/whatsapp.png"
          alt="WhatsApp"
          width={28}
          height={28}
          className="drop-shadow-md"
        />
      </a>

      {/* ⬆️ Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="
            fixed bottom-24 right-6
            bg-amber-300 hover:bg-amber-500
            text-white 
            w-12 h-12 
            rounded-full 
            flex items-center justify-center 
            shadow-xl 
            hover:scale-110 
            transition-all duration-300
            animate-fade-in-up
          "
        >
          ↑
        </button>
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

    </main>
  );
}
