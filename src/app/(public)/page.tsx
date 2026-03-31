"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import ChatWidget from "@/components/ChatWidget";
import { motion, Variants } from "framer-motion";

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
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(
    null,
  );

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
  const [chatOpen, setChatOpen] = useState(false);

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

  const handleShareImage = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "TrueSunshine Gallery",
          text: "Check out this moment from TrueSunshine Preschool",
          url: window.location.origin + imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + imageUrl);
        alert("Image link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const [showGalleryControls, setShowGalleryControls] = useState(true);

  useEffect(() => {
    if (!activeGalleryImage) return;

    setShowGalleryControls(true);

    const timer = setTimeout(() => {
      setShowGalleryControls(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [activeGalleryImage]);

  const fadeUp: Variants = {
    hidden: {
      opacity: 0,
      y: 40,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const fadeDown: Variants = {
    hidden: {
      opacity: 0,
      y: -30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const zoomIn: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 text-gray-800 font-sans">
      {/* Responsive Navbar */}
      <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <Image
              src="/school_logo_short.png"
              alt="TrueSunshine Logo"
              width={60}
              height={60}
              priority
              quality={100}
              className="object-contain"
            />

            <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-rose-500 bg-clip-text text-transparent">
              TrueSunshine
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-800">
            <Link
              href="#about"
              className="hover:text-rose-500 transition-colors"
            >
              About
            </Link>

            <Link
              href="#mission"
              className="hover:text-rose-500 transition-colors"
            >
              Mission & Vision
            </Link>

            <Link
              href="#gallery"
              className="hover:text-rose-500 transition-colors"
            >
              Gallery
            </Link>

            <Link
              href="#contact"
              className="hover:text-rose-500 transition-colors"
            >
              Contact
            </Link>

            {/* Login Button */}
            <Link
              href="/sign-in"
              className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose-400 to-indigo-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-800"
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
          <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-xl rounded-b-2xl px-6 py-5 space-y-4 text-sm">
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/65 via-purple-400/60 to-rose-400/65 sm:from-indigo-400/70 sm:via-purple-400/65 sm:to-pink-300/70" />

        {/* Decorative Blobs (desktop only) */}
        <div className="hidden sm:block absolute -top-32 -left-32 w-[500px] h-[500px] bg-pink-400/30 rounded-full blur-3xl" />
        <div className="hidden sm:block absolute top-24 right-0 w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-3xl" />

        {/* Airplane */}
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden mt-1 sm:mt-2 md:mt-3 lg:mt-4">
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
          {/* ================= HERO LOGO ================= */}
          <div className="relative z-40 flex justify-center mb-6 sm:mb-8 mt-6 sm:mt-14">
            <div className="bg-white/30 backdrop-blur-md p-2 sm:p-3 rounded-full shadow-2xl animate-float-soft pongal-glow">
              <Image
                src="/newLogo.png"
                alt="TrueSunshine Logo"
                width={280}
                height={240}
                priority
                className="w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] pb-2.5 mb-3 sm:mb-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-700 bg-clip-text text-transparent"
          >
            {taglines[index]}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false, amount: 0.2 }}
            className="max-w-xl mx-auto text-sm sm:text-lg text-white/95 font-medium leading-relaxed mb-6 sm:mb-10"
          >
            TrueSunshine Montessori helps children grow with confidence,
            curiosity, and compassion — fostering joyful learning every day.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: false, amount: 0.2 }}
            className="flex flex-row sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-2 mt-2 w-full max-w-md mx-auto"
          >
            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                href="https://forms.gle/iETUsNBC3C7UfD3E7"
                target="_blank"
                className="w-full sm:w-auto inline-block px-6 py-3 rounded-full bg-gradient-to-r from-rose-400 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-2xl transition"
              >
                Enroll Now →
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                href="#contact"
                className="w-full sm:w-auto inline-block px-6 py-3 rounded-full bg-gradient-to-r from-rose-400 to-indigo-500 text-white font-semibold shadow-lg hover:shadow-2xl transition"
              >
                Contact Us →
              </Link>
            </motion.div>
          </motion.div>
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
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent mb-3"
            >
              About TrueSunshine Preschool
            </motion.h2>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: "6rem", opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.3 }}
              className="mx-auto md:mx-0 h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-8 sm:mb-10"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-gray-600 leading-relaxed text-xs sm:text-sm lg:text-base mb-4"
            >
              At{" "}
              <span className="font-semibold text-amber-700">
                TrueSunshine Preschool
              </span>
              , we nurture every child’s natural curiosity and independence
              through hands-on exploration and purposeful play. Our classrooms
              are designed to inspire creativity, responsibility, and a lifelong
              love for learning.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-gray-600 leading-relaxed text-xs sm:text-sm lg:text-base"
            >
              Guided by the Montessori philosophy, we help children grow not
              just academically — but emotionally and socially — in a calm,
              caring, and stimulating environment that celebrates individuality
              and joy.
            </motion.p>
          </div>

          {/* ================= RIGHT — IMAGE + MESSAGE ================= */}
          <div className="flex-1 animate-fade-in-delayed flex flex-col items-center text-center">
            {/* Image with responsive size */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              viewport={{ once: false, amount: 0.3 }}
              className="relative mb-4 sm:mb-6"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 blur-xl opacity-40"></div>

              <div className="relative p-1 rounded-full">
                <Image
                  src="/alekhya_toon.jpg"
                  alt="Chairman"
                  width={260}
                  height={260}
                  className="rounded-full border-4 border-amber-200 object-cover
                 w-[180px] h-[180px]
                 sm:w-[220px] sm:h-[220px]
                 lg:w-[260px] lg:h-[260px]"
                />
              </div>
            </motion.div>

            {/* Chairman Message */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: false, amount: 0.3 }}
              className="leading-relaxed text-gray-700 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 max-w-md"
            >
              “Every child is a seed of possibility. At TrueSunshine, our goal
              is to nurture that possibility with love, guidance, and meaningful
              experiences that empower children to grow with confidence and
              compassion.”
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: false, amount: 0.3 }}
              className="italic text-amber-700 font-semibold text-sm sm:text-base lg:text-lg"
            >
              — Mrs. Alekhya Kumar V
              <br />
              <span className="text-gray-600 not-italic text-xs sm:text-sm">
                Managing Director and Principal, TrueSunshine Preschool
              </span>
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section
        id="mission"
        className="relative bg-gradient-to-br from-[#EDE9FF] via-[#EEF2FF] to-[#F5E9FF] py-10 sm:py-18 px-4 sm:px-10"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT – Cartoon Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="hidden lg:flex justify-center relative"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/mission_vision.png"
                alt="Mission and Vision illustration"
                width={740}
                height={740}
                priority={false}
                className="opacity-95 drop-shadow-2xl select-none"
              />
            </motion.div>
          </motion.div>

          {/* RIGHT – Text Content */}
          <div>
            {/* Section Header */}
            <div className="max-w-2xl mb-14 sm:mb-20">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                viewport={{ once: false, amount: 0.2 }}
                className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent mb-3 text-center"
              >
                Mission & Vision
              </motion.h2>

              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "6rem", opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: false, amount: 0.2 }}
                className="mx-auto h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-8 sm:mb-10"
              />

              <motion.p
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                viewport={{ once: false, amount: 0.2 }}
                className="mt-5 text-purple-900/70 text-xs sm:text-sm lg:text-base"
              >
                At TrueSunshine, every decision we make is guided by a clear
                purpose — nurturing confident learners and compassionate global
                citizens.
              </motion.p>
            </div>

            {/* Mission */}
            <div className="relative mb-12">
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: false, amount: 0.2 }}
                className="absolute -top-8 left-0 text-7xl font-bold text-indigo-200/60"
              >
                01
              </motion.span>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                viewport={{ once: false, amount: 0.2 }}
                className="relative text-2xl sm:text-3xl font-bold text-indigo-700 mb-4"
              >
                Our Mission
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                viewport={{ once: false, amount: 0.2 }}
                className="text-purple-900/70 leading-relaxed text-xs sm:text-sm lg:text-base"
              >
                To inspire self-motivated learners through the Montessori
                philosophy — fostering independence, curiosity, empathy, and
                respect for themselves, others, and the environment.
              </motion.p>
            </div>

            {/* Vision */}
            <div className="relative">
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                viewport={{ once: false, amount: 0.2 }}
                className="absolute -top-8 left-0 text-7xl font-bold text-pink-200/60"
              >
                02
              </motion.span>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                className="relative text-2xl sm:text-3xl font-bold text-indigo-700 mb-4"
              >
                Our Vision
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.1 }}
                viewport={{ once: false, amount: 0.2 }}
                className="text-purple-900/70 leading-relaxed text-xs sm:text-sm lg:text-base"
              >
                To become a leading Montessori institution that nurtures
                confident, compassionate, and capable lifelong learners who
                create a positive impact on the world.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="relative py-14 sm:py-16 px-4 sm:px-10 bg-gradient-to-b from-indigo-200 to-purple-200"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent"
          >
            What Parents Say
          </motion.h3>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "5rem", opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false, amount: 0.2 }}
            className="mx-auto h-1 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 mb-12"
          />

          {/* Swiper Wrapper */}
          <div className="relative max-w-5xl mx-auto">
            {/* Soft background glow */}
            <div className="absolute inset-0 -z-10 flex justify-center">
              <div className="w-72 h-72 bg-purple-200/40 rounded-full blur-3xl" />
            </div>

            <Swiper
              modules={[Autoplay, Pagination]}
              loop={canLoopTestimonials}
              autoplay={
                canLoopTestimonials
                  ? {
                      delay: 3800,
                      pauseOnMouseEnter: true,
                      disableOnInteraction: false,
                    }
                  : false
              }
              pagination={{ clickable: true }}
              className="testimonial-swiper"
            >
              {displayedReviews.map((review, i) => (
                <SwiperSlide
                  key={i}
                  className="flex items-center justify-center px-2"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2 + i * 0.1,
                    }}
                    viewport={{ once: false, amount: 0.2 }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                    }}
                    className="w-full"
                  >
                    <CenteredTestimonialCard
                      text={review.text}
                      name={review.author_name}
                      rating={review.rating}
                      isFallback={review.fallback}
                    />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Gallery Section*/}
      <section
        id="gallery"
        className="bg-gradient-to-b from-indigo-200 to-purple-200 py-6 sm:py-14 px-4 sm:px-6 text-center"
      >
        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent"
        >
          Gallery
        </motion.h3>

        {/* Decorative Divider */}
        <div className="mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-8 sm:mb-10" />

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
              1024: { slidesPerView: 5, spaceBetween: 24 },
            }}
            className="rounded-xl px-10"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.08,
                  }}
                  viewport={{ once: false, amount: 0.2 }}
                  whileHover={{
                    scale: 1.04,
                    y: -6,
                  }}
                  className="w-full"
                >
                  {/* Image (aspect ratio safe for tablet) */}
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={`/${img}`}
                      alt={`TrueSunshine Gallery ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-500" />

                  {/* Caption Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2 + i * 0.05,
                    }}
                    viewport={{ once: false, amount: 0.2 }}
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2"
                  >
                    <p className="text-xs text-white text-left">
                      Montessori Activities · TrueSunshine Preschool
                    </p>
                  </motion.div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ================= GALLERY LIGHTBOX ================= */}
      {activeGalleryImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center px-4"
          onClick={() => setActiveGalleryImage(null)}
          onMouseMove={() => setShowGalleryControls(true)}
          onTouchStart={() => setShowGalleryControls(true)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <Image
              src={activeGalleryImage}
              alt="Gallery Preview"
              width={1400}
              height={900}
              className="rounded-xl object-contain w-full max-h-[85vh]"
            />

            {/* CLOSE BUTTON */}
            {showGalleryControls && (
              <button
                onClick={() => setActiveGalleryImage(null)}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg hover:scale-110 transition"
                title="Close"
              >
                <Image src="/close.png" alt="Close" width={18} height={18} />
              </button>
            )}

            {/* ACTION BUTTONS */}
            {showGalleryControls && (
              <div className="absolute top-4 right-4 flex gap-3">
                {/* Download */}
                <a
                  href={activeGalleryImage}
                  download
                  className="
              w-10 h-10
              rounded-full
              bg-white/90 backdrop-blur
              flex items-center justify-center
              shadow-lg
              hover:scale-110
              transition
            "
                  title="Download"
                >
                  <Image
                    src="/downloads.png"
                    alt="Download"
                    width={18}
                    height={18}
                  />
                </a>

                {/* Share */}
                <button
                  onClick={() => handleShareImage(activeGalleryImage)}
                  className="
              w-10 h-10
              rounded-full
              bg-white/90 backdrop-blur
              flex items-center justify-center
              shadow-lg
              hover:scale-110
              transition
            "
                  title="Share"
                >
                  <Image src="/share.png" alt="Share" width={18} height={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Us Section*/}
      <section
        id="contact"
        className="relative bg-gradient-to-br from-[#EDE9FF] via-[#EEF2FF] to-[#F5E9FF] py-12 sm:py-18 px-4 sm:px-10 overflow-hidden"
      >
        {/* Soft background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent"
          >
            Contact Us
          </motion.h3>

          {/* Divider */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: "6rem", opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: false, amount: 0.2 }}
            className="mx-auto h-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: false, amount: 0.2 }}
            className="text-purple-900/70 text-sm sm:text-base max-w-xl mx-auto mb-12"
          >
            We’d love to connect with you. Reach out for admissions, campus
            visits, or general queries.
          </motion.p>

          {/* ================= MAP + FORM ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-8 items-stretch">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, amount: 0.2 }}
              className="overflow-hidden rounded-[32px] border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.97106829474!2d78.38164457414304!3d17.461098800679487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93d6209e0f0d%3A0x95c9fe94d6e83177!2sMohan's%20Elite%20Apartment!5e0!3m2!1sen!2sin!4v1763088792805!5m2!1sen!2sin"
                className="w-full h-[320px] border-0"
                allowFullScreen
                loading="lazy"
              />
            </motion.div>

            {/* Chatbot Card */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: false, amount: 0.2 }}
              className="rounded-[32px] border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col justify-center"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-rose-400 to-indigo-500 mb-5 mx-auto shadow-lg">
                <Image
                  src="/live-chat.png"
                  alt="Chat"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>

              <h4 className="text-xl font-bold text-indigo-800 text-center mb-3">
                Need Quick Help?
              </h4>

              <p className="text-gray-600 text-sm sm:text-base text-center leading-relaxed mb-6">
                Use our chatbot available on the bottom-right corner to enquire
                about admissions, fees, classes, timings, and more.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => setChatOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:scale-105 transition"
                >
                  Open Chat
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ⚓ Footer */}
      <footer className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 text-white pt-12 pb-6 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: false, amount: 0.2 }}
              className="text-2xl font-bold mb-3"
            >
              TrueSunshine
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: false, amount: 0.2 }}
              className="text-black text-sm leading-relaxed"
            >
              Nurturing curiosity, independence, and joyful learning through the
              Montessori way.
            </motion.p>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>

            <ul className="space-y-2 text-black text-sm">
              {[
                { href: "#about", label: "About Us" },
                { href: "#admissions", label: "Admissions" },
                { href: "#gallery", label: "Gallery" },
                { href: "#contact", label: "Contact" },
              ].map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  viewport={{ once: false, amount: 0.2 }}
                >
                  <a
                    href={item.href}
                    className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-black text-sm">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: false, amount: 0.2 }}
                className="flex items-start gap-2"
              >
                <Image
                  src="/placeholder.png"
                  alt="Location"
                  width={18}
                  height={18}
                  className="mt-0.5 object-contain"
                />
                <span>
                  Mohan&apos;s Elite Apartments Khanamet, Hyderabad
                  Telangana-500084
                </span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: false, amount: 0.2 }}
                className="flex items-start gap-2"
              >
                <Image
                  src="/phone.png"
                  alt="Phone"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>+91 79895 99833</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: false, amount: 0.2 }}
                className="flex items-start gap-2"
              >
                <Image
                  src="/email.png"
                  alt="Email"
                  width={18}
                  height={18}
                  className="object-contain"
                />
                <span>truesunshine.playschools@gmail.com</span>
              </motion.li>
            </ul>
          </div>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: false, amount: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-3">Follow Us</h4>

            <div className="flex gap-4">
              {[
                { src: "/facebook.png", alt: "Facebook" },
                { src: "/instagram.png", alt: "Instagram" },
                { src: "/youtube.png", alt: "YouTube" },
              ].map((social, i) => (
                <motion.a
                  key={social.alt}
                  href="#"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  whileHover={{
                    scale: 1.2,
                    rotate: 8,
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
                >
                  <Image
                    src={social.src}
                    alt={social.alt}
                    width={26}
                    height={26}
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: false, amount: 0.2 }}
          className="border-t-2 border-purple-800/50 mt-10 pt-4 text-center text-sm text-black font-bold"
        >
          © {new Date().getFullYear()} TrueSunshine Montessori — Growing Minds,
          Shaping Futures 🌻
        </motion.div>
      </footer>

      {/* ================= PREMIUM FLOATING DOCK ================= */}
      <div
        className="
    fixed right-5 bottom-6 z-[9999]
    flex flex-col items-center gap-3
    p-2
    rounded-full
    bg-transparent backdrop-blur-xl
    border border-white/40
    shadow-2xl
  "
      >
        {/* WhatsApp */}
        <div className="relative group">
          <span
            className="
        absolute right-14 top-1/2 -translate-y-1/2
        whitespace-nowrap
        rounded-lg bg-black/80 px-3 py-1.5
        text-xs text-white
        opacity-0 group-hover:opacity-100
        transition duration-300
        pointer-events-none
      "
          >
            Chat on WhatsApp
          </span>

          <a
            href="https://wa.me/7989599833"
            target="_blank"
            rel="noopener noreferrer"
            className="
        w-11 h-11 rounded-full
        flex items-center justify-center
        hover:scale-110 transition
      "
          >
            <Image src="/whatsapp.png" alt="WhatsApp" width={32} height={32} />
          </a>
        </div>

        {/* Scroll To Top */}
        {showScrollTop && !chatOpen && (
          <div className="relative group">
            <span
              className="
          absolute right-12 top-1/2 -translate-y-1/2
          whitespace-nowrap
          rounded-lg bg-black/80 px-3 py-1.5
          text-xs text-white
          opacity-0 group-hover:opacity-100
          transition duration-300
          pointer-events-none
        "
            >
              Scroll to Top
            </span>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="
          w-8 h-8 rounded-full
          bg-gradient-to-r from-rose-400 to-indigo-500
          text-white flex items-center justify-center
          shadow-md hover:scale-110 transition
        "
            >
              ↑
            </button>
          </div>
        )}

        {/* Chat Toggle */}
        <div className="relative group">
          <span
            className="
        absolute right-12 top-1/2 -translate-y-1/2
        whitespace-nowrap
        rounded-lg bg-black/80 px-3 py-1.5
        text-xs text-white
        opacity-0 group-hover:opacity-100
        transition duration-300
        pointer-events-none
      "
          >
            {chatOpen ? "Close Chat" : "Open Chat"}
          </span>

          <button
            onClick={() => setChatOpen((prev) => !prev)}
            className="
        w-8 h-8 rounded-full
        flex items-center justify-center
        shadow-md hover:scale-110 transition
      "
          >
            <Image
              src="/chat-bot.png"
              alt="Chat"
              width={28}
              height={28}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Chat Box */}
      {chatOpen && (
        <div className="fixed right-5 bottom-40 sm:bottom-44 z-[9999]">
          <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      )}
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
