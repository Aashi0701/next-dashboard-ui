"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

// ---------------- ZOD SCHEMA ----------------
const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type ContactFormData = z.infer<typeof ContactSchema>;

// ---------------- PAGE ----------------
export default function HomePage() {
  /* ---------------- STATE ---------------- */
  const [menuOpen, setMenuOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const today = new Date();
  const month = today.getMonth(); // 0 = Jan
  const date = today.getDate();

  type Festival = "pongal" | "christmas" | "diwali" | null;

  const festival: Festival =
    // 🪔 PONGAL (Jan 14–17)
    month === 0 && date >= 7 && date <= 17
      ? "pongal"
      : // 🎄 CHRISTMAS (Dec 20–31)
        month === 11 && date >= 20
        ? "christmas"
        : // 🪔 DIWALI (example range – adjust yearly)
          month === 9 && date >= 28 && date <= 31
          ? "diwali"
          : null;

  const isFestiveMode = festival !== null;

  /* ---------------- FORM ---------------- */
  const { register, handleSubmit, reset } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
  });

  /* ---------------- DATA ---------------- */
  const taglines = ["Nurturing Minds", "Inspiring Hearts", "Building Futures"];

  const images = [
    "gallery1.jpg",
    "gallery2.jpg",
    "gallery3.jpg",
    "gallery4.jpg",
    "gallery5.jpg",
    "gallery6.jpg",
    "gallery7.jpg",
    "gallery8.jpg",
    "gallery9.jpg",
    "gallery10.jpg",
  ];

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((prev) => (prev + 1) % taglines.length),
      2500,
    );

    return () => clearInterval(timer);
  }, [taglines.length]);

  /* ---------------- HANDLERS ---------------- */
  const onSubmit = (data: ContactFormData) => {
    alert("Message sent successfully!");
    reset();
  };

  const PongalKite = ({ className = "" }) => {
    const gradientId = useId();

    return (
      <svg
        viewBox="0 0 48 72"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Kite body */}
        <polygon
          points="24,0 48,24 24,48 0,24"
          fill={`url(#${gradientId})`}
          stroke="#FF9800"
          strokeWidth="1.5"
        />

        {/* Knot */}
        <circle cx="24" cy="24" r="3" fill="#FFF3CD" />

        {/* Tail string */}
        <line
          x1="24"
          y1="48"
          x2="24"
          y2="70"
          stroke="#FFF3CD"
          strokeWidth="1.5"
        />

        {/* Tail bows */}
        <path d="M20 56 L28 56" stroke="#FF7043" strokeWidth="2" />
        <path d="M20 62 L28 62" stroke="#FFD54F" strokeWidth="2" />

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#FF6F00" />
            <stop offset="100%" stopColor="#FFD54F" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const [googleReviews, setGoogleReviews] = useState<any[]>([]);

  const displayedReviews =
    googleReviews.length >= 1
      ? googleReviews
      : [
          {
            author_name: "Verified Parent",
            text: "Parents consistently appreciate our caring environment and child-focused learning approach.",
            rating: 5,
            fallback: true,
          },
        ];

  const canLoopTestimonials = displayedReviews.length > 1;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/google-reviews");

        if (!res.ok) {
          console.error("Google Reviews API failed:", res.status);
          return;
        }

        const text = await res.text();

        if (!text) {
          console.warn("Google Reviews API returned empty response");
          return;
        }

        const data = JSON.parse(text);

        if (data?.reviews?.length) {
          setGoogleReviews(data.reviews || []);
        }
      } catch (err) {
        console.error("Failed to load Google reviews:", err);
      }
    };

    fetchReviews();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 text-gray-800 font-sans">
      {/* Responsive Navbar */}
      <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/my_logo.png"
              alt="TrueSunshine Logo"
              width={42}
              height={42}
              className="rounded-full p-1"
            />
            <span
              className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-500
                 bg-clip-text text-transparent"
            >
              TrueSunshine
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black">
            <Link
              href="#about"
              className="font-bold hover:text-rose-500 transition"
            >
              About
            </Link>
            <Link
              href="#mission"
              className="font-bold hover:text-rose-500 transition"
            >
              Mission & Vision
            </Link>
            <Link
              href="#gallery"
              className="font-bold hover:text-rose-500 transition"
            >
              Gallery
            </Link>
            <Link
              href="#contact"
              className="font-bold hover:text-rose-500 transition"
            >
              Contact
            </Link>

            {/* Login CTA */}
            <Link
              href="/sign-in"
              className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
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
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-xl rounded-b-2xl px-6 py-5 space-y-4 text-sm ">
            {["about", "mission", "gallery", "contact"].map((item) => (
              <Link
                key={item}
                href={`#${item}`}
                onClick={() => setMenuOpen(false)}
                className="block font-medium text-gray-800 hover:text-purple-600"
              >
                {item
                  .replace("-", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}

            <Link
              href="/sign-in"
              className="block text-center mt-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow-md"
            >
              Login
            </Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/gallery1.png')" }}
        />

        {/* Gradient Overlay (slightly stronger for mobile readability) */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 via-purple-500/75 to-pink-400/80 sm:from-indigo-400/70 sm:via-purple-400/65 sm:to-pink-300/70" />

        {/* Decorative Blobs (desktop only) */}
        <div className="hidden sm:block absolute -top-32 -left-32 w-[500px] h-[500px] bg-pink-400/30 rounded-full blur-3xl" />
        <div className="hidden sm:block absolute top-24 right-0 w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-3xl" />

        {/* Airplane */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden mt-2 sm:mt-4 md:mt-6 lg:mt-8">
          <div className="airplane-move">
            <div className="airplane-flip">
              <Image
                src="/transport.png"
                alt="Airplane"
                width={40}
                height={28}
                className="h-auto w-auto"
              />
            </div>
            <div className="rope-image">
              <Image
                src="/node.png"
                alt="Rope"
                width={28}
                height={10}
                className="h-auto w-auto"
              />
            </div>
            <div className="cloth-banner text-xs sm:text-sm">
              <span>Admissions Open – 2026–27</span>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="relative z-40 w-full max-w-3xl px-4 sm:px-6 text-center text-white">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-8">
            <div className="bg-white/25 backdrop-blur-md p-2.5 sm:p-4 rounded-full shadow-2xl animate-float-soft pongal-glow">
              <Image
                src="/my_logo.png"
                alt="TrueSunshine Logo"
                width={70}
                height={70}
                className="sm:w-[125px] sm:h-[125px]"
                priority
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] pb-2.5 mb-3 sm:mb-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-700 bg-clip-text text-transparent">
            {taglines[index]}
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl mx-auto text-sm sm:text-lg text-white/95 font-medium leading-relaxed mb-6 sm:mb-10">
            TrueSunshine Montessori helps children grow with confidence,
            curiosity, and compassion — fostering joyful learning every day.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="https://forms.gle/iETUsNBC3C7UfD3E7"
              target="_blank"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              Enroll Now →
            </Link>

            <Link
              href="#contact"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative bg-gradient-to-b from-indigo-200 to-purple-200 py-6 sm:py-16 lg:py-18 px-4 sm:px-12 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 sm:gap-14">
          {/* ================= LEFT — ABOUT TEXT ================= */}
          <div className="flex-1 text-center md:text-left animate-fade-in-up">
            <h2
              className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                 bg-clip-text text-transparent mb-3"
            >
              About TrueSunshine Preschool
            </h2>

            <div
              className="mx-auto w-24 h-1 rounded-full
                    bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
                    mb-8 sm:mb-10"
            ></div>

            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm lg:text-base mb-4">
              At{" "}
              <span className="font-semibold text-amber-700">
                TrueSunshine Preschool
              </span>
              , we nurture every child’s natural curiosity and independence
              through hands-on exploration and purposeful play. Our classrooms
              are designed to inspire creativity, responsibility, and a lifelong
              love for learning.
            </p>

            <p className="text-gray-600 leading-relaxed text-xs sm:text-sm lg:text-base">
              Guided by the Montessori philosophy, we help children grow not
              just academically — but emotionally and socially — in a calm,
              caring, and stimulating environment that celebrates individuality
              and joy.
            </p>
          </div>

          {/* ================= RIGHT — IMAGE + MESSAGE ================= */}
          <div className="flex-1 animate-fade-in-delayed flex flex-col items-center text-center">
            {/* Image with responsive size */}
            <div className="p-1 rounded-full glowing-ring mb-4 sm:mb-6">
              <Image
                src="/alekhya_toon.jpg"
                alt="Chairman"
                width={180}
                height={180}
                className="rounded-full shadow-md border-4 border-amber-200 object-cover w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px]"
              />
            </div>

            {/* Chairman Message */}
            <p className="leading-relaxed text-gray-700 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 max-w-md">
              “Every child is a seed of possibility. At TrueSunshine, our goal
              is to nurture that possibility with love, guidance, and meaningful
              experiences that empower children to grow with confidence and
              compassion.”
            </p>

            <p className="italic text-amber-700 font-semibold text-sm sm:text-base lg:text-lg">
              — Mrs. Alekhya Kumar V
              <br />
              <span className="text-gray-600 not-italic text-xs sm:text-sm">
                Managing Director and Principal, TrueSunshine Preschool
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        id="mission"
        className="relative py-14 sm:py-18 px-4 sm:px-12 overflow-hidden
             bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-32 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-32 w-72 h-72 bg-pink-300/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Heading */}
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4
                 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                 bg-clip-text text-transparent"
          >
            Our Mission & Vision
          </h3>

          {/* Divider */}
          <div
            className="mx-auto w-24 h-1 rounded-full
                    bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
                    mb-8 sm:mb-10"
          ></div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-12">
            {/* ===== Mission Card ===== */}
            <div
              className="
      group
      p-5 sm:p-7 md:p-9
      rounded-2xl sm:rounded-3xl
      bg-white/95 backdrop-blur-md
      shadow-md sm:shadow-lg
      border border-white/40
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-2xl
      text-center md:text-left
    "
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto md:mx-0 mb-4 sm:mb-6 flex items-center justify-center
        rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-inner"
              >
                <Image
                  src="/mission.png"
                  alt="Mission Icon"
                  width={40}
                  height={40}
                />
              </div>

              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 mb-3 sm:mb-4">
                Our Mission
              </h4>

              <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
                To inspire self-motivated learners through the Montessori
                philosophy — cultivating independence, curiosity, empathy, and
                respect for themselves, others, and the environment.
              </p>
            </div>

            {/* ===== Vision Card ===== */}
            <div
              className="
      group
      p-5 sm:p-7 md:p-9
      rounded-2xl sm:rounded-3xl
      bg-white/95 backdrop-blur-md
      shadow-md sm:shadow-lg
      border border-white/40
      transition-all duration-300
      hover:-translate-y-1 hover:shadow-2xl
      text-center md:text-left
    "
            >
              <div
                className="
        w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
        mx-auto md:mx-0 mb-4 sm:mb-6
        flex items-center justify-center
        rounded-xl sm:rounded-2xl
        bg-gradient-to-br from-rose-100 to-pink-200
        shadow-inner
      "
              >
                <Image
                  src="/vision.png"
                  alt="Vision Icon"
                  width={40}
                  height={40}
                />
              </div>

              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 mb-3 sm:mb-4">
                Our Vision
              </h4>

              <p className="text-gray-600 text-xs sm:text-base leading-relaxed">
                To become a leading Montessori institution that nurtures
                confident, compassionate, and capable lifelong learners who
                create a positive impact on the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="relative py-12 px-4 sm:px-10
             bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4
                 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                 bg-clip-text text-transparent"
          >
            What Parents Say
          </h3>

          <div
            className="mx-auto w-20 h-1 rounded-full
                    bg-gradient-to-r from-indigo-400 to-pink-400 mb-14"
          />

          {/* Swiper */}
          <div className="relative max-w-6xl mx-auto testimonial-swiper">
            <Swiper
              modules={[Autoplay, Pagination]}
              loop={canLoopTestimonials}
              autoplay={
                canLoopTestimonials
                  ? {
                      delay: 3500,
                      pauseOnMouseEnter: true,
                      disableOnInteraction: false,
                    }
                  : false
              }
              pagination={{ clickable: true }}
            >
              {displayedReviews.map((review, i) => (
                <SwiperSlide
                  key={i}
                  className="flex items-center justify-center"
                >
                  <CenteredTestimonialCard
                    text={review.text}
                    name={review.author_name}
                    rating={review.rating}
                    isFallback={review.fallback}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Pagination OUTSIDE slide flow */}
            <div className="testimonial-pagination" />
          </div>
        </div>
      </section>

      {/* Gallery Section*/}
      <section
        id="gallery"
        className="bg-gradient-to-b from-indigo-200 to-rose-200 py-6 sm:py-14 px-4 sm:px-6 text-center"
      >
        {/* Title */}
        <h3
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4
                 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                 bg-clip-text text-transparent"
        >
          Gallery
        </h3>

        {/* Decorative Divider */}
        <div
          className="mx-auto w-24 h-1 rounded-full
                    bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
                    mb-8 sm:mb-10"
        ></div>

        <div className="max-w-7xl mx-auto">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            spaceBetween={16}
            loop
            pagination={{ clickable: true }}
            navigation
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              720: { slidesPerView: 3, spaceBetween: 22 },
              1024: { slidesPerView: 6, spaceBetween: 24 },
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
                    className="
                object-cover w-full
                h-40          /* 📱 mobile */
                sm:h-46       /* 📱 tablets */
                lg:h-50       /* 💻 desktop */
              "
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Contact Us Section*/}
      <section
        id="contact"
        className="relative bg-gradient-to-b from-indigo-200 to-rose-200 py-6 sm:py-16 lg:py-10 px-4 sm:px-8 lg:px-12 text-center overflow-hidden"
      >
        {/* Soft background shapes */}
        <div className="absolute -top-20 -left-16 w-40 h-40 sm:w-60 sm:h-60 bg-amber-100 blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-rose-100 blur-3xl opacity-30" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Title */}
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2
                 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
                 bg-clip-text text-transparent"
          >
            Contact Us
          </h3>

          {/* Decorative Divider */}
          <div
            className="mx-auto w-24 h-1 rounded-full
                    bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
                    mb-8 sm:mb-10"
          ></div>

          <p className="text-gray-600 font-semibold text-sm sm:text-base max-w-xl mx-auto mb-8 sm:mb-12">
            We&apos;d love to connect with you. Reach out for admissions, campus
            visits, or general queries.
          </p>

          {/* ================= CONTACT CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
            {/* Address */}
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-amber-700 text-2xl mb-2">📍</div>
              <h4 className="font-semibold text-base sm:text-lg mb-1">
                Address
              </h4>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Mohan&apos;s Elite Appartments, Khanamet, <br />
                Hyderabad Telangana – 500084
              </p>
            </div>

            {/* Phone */}
            <div className="bg-rose-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-rose-600 text-2xl mb-2">📞</div>
              <h4 className="font-semibold text-base sm:text-lg mb-1">Phone</h4>
              <p className="text-gray-600 text-sm">+91 79895 99833</p>
            </div>

            {/* Email */}
            <div className="bg-amber-50 p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-amber-700 text-2xl mb-2">📧</div>
              <h4 className="font-semibold text-base sm:text-lg mb-1">Email</h4>
              <p className="text-gray-600 text-xs sm:text-sm break-words">
                truesunshine.playschools@gmail.com
              </p>
            </div>
          </div>

          {/* ================= MAP + FORM ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
            {/* Map */}
            <div className="w-full h-60 sm:h-72 rounded-xl overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.97106829474!2d78.38164457414304!3d17.461098800679487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93d6209e0f0d%3A0x95c9fe94d6e83177!2sMohan&#39;s%20Elite%20Apartment!5e0!3m2!1sen!2sin!4v1763088792805!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white p-5 sm:p-8 rounded-xl shadow-md space-y-3 sm:space-y-4"
            >
              <h4 className="text-base sm:text-lg font-semibold text-amber-700 mb-1">
                Send Us a Message
              </h4>

              <input
                type="text"
                placeholder="Your Name"
                {...register("name")}
                className="w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-amber-500"
              />

              <input
                type="email"
                placeholder="Your Email"
                {...register("email")}
                className="w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-amber-500"
              />

              <textarea
                placeholder="Your Message"
                rows={3}
                {...register("message")}
                className="w-full p-2.5 sm:p-3 text-sm border rounded-md focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-500 hover:bg-amber-700 text-white font-semibold rounded-md transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ⚓ Footer */}
      <footer className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 text-white pt-12 pb-6 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-3">TrueSunshine</h3>
            <p className="text-black text-sm leading-relaxed">
              Nurturing curiosity, independence, and joyful learning through the
              Montessori way.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-black text-sm">
              <li>
                <a href="#about" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#admissions" className="hover:text-white transition">
                  Admissions
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-black text-sm">
              <li>
                📍 Mohan&apos;s Elite Appartments Khanamet, Hyderabad
                Telangana-500084
              </li>
              <li>📞 +91 79895 99833</li>
              <li>📧 truesunshine.playschools@gmail.com</li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:scale-110 transition">
                <Image
                  src="/facebook.png"
                  alt="Facebook"
                  width={26}
                  height={26}
                />
              </a>
              <a href="#" className="hover:scale-110 transition">
                <Image
                  src="/instagram.png"
                  alt="Instagram"
                  width={26}
                  height={26}
                />
              </a>
              <a href="#" className="hover:scale-110 transition">
                <Image
                  src="/youtube.png"
                  alt="YouTube"
                  width={26}
                  height={26}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-4 border-radius-0 border-purple-800 mt-10 pt-4 text-center text-sm text-black font-bold">
          © {new Date().getFullYear()} TrueSunshine Montessori — Growing Minds,
          Shaping Futures 🌻
        </div>
      </footer>

      {/* ================= FLOATING UI LAYER ================= */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {/* WhatsApp */}
        <a
          href="https://wa.me/7989599833"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto fixed bottom-4 right-4 sm:bottom-6 sm:right-6
            bg-gray-300 text-white
            w-10 h-10              /* 📱 mobile */
            sm:w-12 sm:h-12        /* 📱 tablet+ */
            rounded-full flex items-center justify-center shadow-xl hover:scale-20 transition-all duration-300 animate-pulse-soft"
        >
          <Image
            src="/whatsapp.png"
            alt="WhatsApp"
            width={26} /* 📱 mobile */
            height={26}
            className="sm:w-[28px] sm:h-[28px]" /* tablet+ */
          />
        </a>

        {/* Scroll To Top */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="pointer-events-auto fixed bottom-16 right-4 sm:bottom-20 sm:right-6 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600
        text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-300 animate-fade-in-up">
            <span className="text-xl sm:text-2xl font-bold">↑</span>
          </button>
        )}
      </div>
    </main>
  );
}

type CenteredTestimonialCardProps = {
  text: string;
  name: string;
  rating?: number;
  isFallback?: boolean;
};

function CenteredTestimonialCard({
  text,
  name,
  rating = 5,
  isFallback = false,
}: CenteredTestimonialCardProps) {
  return (
    <div
      className="
    relative
    max-w-3xl mx-auto
    min-h-[280px] sm:min-h-[300px]
    rounded-3xl
    px-6 pt-6 pb-10
    bg-white/20
    backdrop-blur-xl
    border border-white/40
    flex flex-col justify-between
  "
    >
      {/* Decorative quote */}
      <div className="absolute top-10 right-14 text-6xl text-white/80 select-none">
        “
      </div>

      {/* Text */}
      <p className="text-gray-800 text-sm sm:text-base leading-relaxed line-clamp-3">
        {text}
      </p>

      {/* Avatar */}
      <div className="flex justify-center mb-3">
        <div
          className="
            w-12 h-12 rounded-full
            bg-gradient-to-br from-indigo-500 to-pink-500
            flex items-center justify-center
            text-white font-semibold
            shadow-lg
          "
        >
          {name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Name */}
      <p className="font-semibold text-indigo-800 text-sm">{name}</p>

      {/* Role */}
      <p className="text-xs text-gray-600 mb-3">
        Parent, TrueSunshine Preschool
      </p>

      {/* Rating */}
      <div className="flex justify-center gap-1 text-sm text-amber-400">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>

      {/* Google verification */}
      {!isFallback && (
        <div className="mt-4 flex justify-center items-center gap-2 animate-fade-in">
          {/* Google logo */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 48 48"
            className="opacity-80"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.06 1.53 7.46 2.8l5.44-5.44C33.68 4.07 29.25 2 24 2 14.73 2 6.98 7.8 4.1 16.2l6.7 5.2C12.4 14.5 17.7 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.7-.15-3.33-.43-4.9H24v9.3h12.4c-.54 2.9-2.17 5.36-4.6 7.03l7.07 5.5C42.6 37.5 46.1 31.6 46.1 24.5z"
            />
            <path
              fill="#FBBC05"
              d="M10.8 28.4c-.5-1.5-.8-3.1-.8-4.9s.3-3.4.8-4.9l-6.7-5.2C2.6 16.5 2 20.2 2 23.5s.6 7 2.1 10.1l6.7-5.2z"
            />
            <path
              fill="#34A853"
              d="M24 46c5.25 0 9.68-1.73 12.9-4.7l-7.07-5.5c-2 1.35-4.56 2.15-5.83 2.15-6.3 0-11.6-5-13.2-11.9l-6.7 5.2C6.98 40.2 14.73 46 24 46z"
            />
          </svg>

          {/* Verified label */}
          <span className="text-[11px] font-medium text-gray-600 tracking-wide">
            Verified Google Review
          </span>
        </div>
      )}
    </div>
  );
}
