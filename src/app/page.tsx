"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Catalog from "@/components/Catalog";
import CartSidebar from "@/components/CartSidebar";
import CustomCakeBuilder from "@/components/CustomCakeBuilder";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/db";
import Link from "next/link";
import { ChevronDown, MessageCircle, Star, Quote, ArrowRight, MapPin, Mail, Phone, Check, Play, Volume2, VolumeX, X, Maximize2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const BUCKET_BASE_URL = "https://xbddtwvpyuyykofiezlu.supabase.co/storage/v1/object/public/Multimedia";

interface VideoItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

const PROCESS_VIDEOS: VideoItem[] = [
  {
    id: "video-1",
    src: `${BUCKET_BASE_URL}/Videos/Digna%20de%20una%20reina.mp4`,
    title: "Digna de una Reina",
    subtitle: "Torta de gala con detalles dorados y rosas hechas a mano",
  },
  {
    id: "video-2",
    src: `${BUCKET_BASE_URL}/Videos/Detalles%20y%20romanticismo.mp4`,
    title: "Detalles & Romanticismo",
    subtitle: "Proceso de decoración floral en crema de mantequilla suiza (buttercream)",
  },
  {
    id: "video-3",
    src: `${BUCKET_BASE_URL}/Videos/La%20definici.mp4`,
    title: "La Definición del Arte",
    subtitle: "Torta de bodas de tres pisos con texturas sofisticadas y acabado editorial",
  }
];



// Helper FAQ Accordion component
function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-outline-variant/35 rounded overflow-hidden bg-surface-bright">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 hover:bg-surface-container-low transition-colors text-left outline-none cursor-pointer"
      >
        <span className="font-headline-sm text-lg text-dark-chocolate font-medium">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-primary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className={`accordion-content bg-surface-container-low/50 px-6 ${isOpen ? "open" : ""}`}>
        <p className="py-4 text-on-surface-variant font-body-md text-sm leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

// Helper Animated Counter component using requestAnimationFrame
function AnimatedCounter({ target, suffix = "", duration = 1500 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    let cancelled = false;

    const step = (timestamp: number) => {
      if (cancelled) return;
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
    return () => {
      cancelled = true;
    };
  }, [target, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      const thousands = (num / 1000).toFixed(0);
      return `${thousands}k`;
    }
    return num.toString();
  };

  return <>{formatNumber(count)}{suffix}</>;
}

export default function Home() {
  const { setIsBuilderOpen, setIsCartOpen } = useCart();
  
  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactDate, setContactDate] = useState("");
  const [contactGuests, setContactGuests] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<VideoItem | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactDate) {
      alert("Por favor completa los campos requeridos (Nombre, Teléfono y Fecha).");
      return;
    }

    setIsSubmitting(true);

    try {
      const guests = parseInt(contactGuests) || 10;
      const order = await createOrder({
        customerName: contactName,
        customerPhone: contactPhone,
        eventDate: contactDate,
        orderType: "custom",
        guestCount: guests,
        message: contactMessage || undefined,
        totalPrice: guests * 3000, // simple rough estimate
        customDetails: {
          portions: guests,
          spongeFlavor: "Elegido por asesoría",
          fillingFlavor: "Elegido por asesoría",
          cakeText: "Revisar en entrevista",
          colors: ["Blanco Parchment"],
        },
      });

      setSuccessOrder(order);
      
      // Reset contact form
      setContactName("");
      setContactPhone("");
      setContactDate("");
      setContactGuests("");
      setContactMessage("");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      {/* WhatsApp Floating Action Button */}
      <a
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-8 right-8 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        href="https://wa.me/573001234567"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-surface-bright text-on-surface px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs font-semibold shadow border border-outline-variant/20 pointer-events-none">
          Hablemos por WhatsApp
        </span>
      </a>

      {/* Hero Section */}
      <header className="pt-28 pb-16 md:pt-48 md:pb-32 px-gutter relative overflow-hidden bg-surface-bright">
        {/* Abstract Background Shapes (Floating Blobs) */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-container/25 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 -z-10 animate-pulse-glow"></div>
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-surface-dim/40 rounded-full blur-[100px] -translate-x-1/2 -z-10 animate-float"></div>
        
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary-container/10 border border-tertiary-container/30 mb-6 md:mb-8 mx-auto md:mx-0 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="font-label-lg text-[10px] text-tertiary uppercase tracking-widest">
                Repostería Artesanal · Hecho con amor
              </span>
            </div>
            
            <h1 className="font-display-lg text-dark-chocolate mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] font-normal text-balance animate-fade-in-up animation-delay-100">
              Cada torta, <br className="hidden md:block" />
              <span className="italic text-primary">una historia</span> que se saborea
            </h1>
            
            <p className="font-body-lg text-on-surface-variant mb-8 md:mb-10 max-w-md mx-auto md:mx-0 text-sm sm:text-base md:text-lg animate-fade-in-up animation-delay-200">
              Diseños exclusivos y sabores que despiertan emociones. Creamos piezas únicas para tus momentos más especiales con ingredientes premium y dedicación artesanal.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-10 md:mb-16 w-full sm:w-auto animate-fade-in-up animation-delay-300">
              <a
                className="w-full sm:w-auto bg-primary text-surface-bright px-8 py-4 rounded hover:bg-on-primary-container transition-colors text-xs font-label-lg tracking-wider uppercase cursor-pointer text-center"
                href="#menu"
              >
                Ver Creaciones
              </a>
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="w-full sm:w-auto border border-dark-chocolate/30 text-dark-chocolate px-8 py-4 rounded hover:border-dark-chocolate transition-colors text-xs font-label-lg tracking-wider uppercase cursor-pointer bg-transparent text-center"
              >
                Diseñar Torta
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-8 pt-8 border-t border-outline-variant/20 w-full max-w-md mx-auto md:mx-0 animate-fade-in-up animation-delay-400">
              <div>
                <div className="font-headline-md text-2xl sm:text-3xl text-dark-chocolate mb-1">
                  <AnimatedCounter target={5} suffix="+" />
                </div>
                <div className="font-label-md text-[9px] sm:text-[10px] text-on-surface-variant uppercase tracking-wider">Años Exp.</div>
              </div>
              <div>
                <div className="font-headline-md text-2xl sm:text-3xl text-dark-chocolate mb-1">
                  <AnimatedCounter target={1000} suffix="+" />
                </div>
                <div className="font-label-md text-[9px] sm:text-[10px] text-on-surface-variant uppercase tracking-wider">Clientes</div>
              </div>
              <div>
                <div className="font-headline-md text-2xl sm:text-3xl text-dark-chocolate mb-1">
                  <AnimatedCounter target={100} suffix="%" />
                </div>
                <div className="font-label-md text-[9px] sm:text-[10px] text-on-surface-variant uppercase tracking-wider">Artesanal</div>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="mt-4 md:mt-0 relative z-10 md:ml-auto flex justify-center w-full animate-fade-in-up animation-delay-200">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] aspect-[4/5] rounded-t-full overflow-hidden border-4 border-surface-bright shadow-2xl bg-surface-container-low">
              <img
                alt="Premium artisan bakery cake"
                className="w-full h-full object-cover"
                src="/hero-cake.jpg"
              />
            </div>
            
            {/* Floating Badge (Rotating badge logic) */}
            <div className="absolute top-20 -left-6 bg-surface-bright p-4 rounded-full shadow-xl border border-outline-variant/10 w-24 h-24 flex items-center justify-center flex-col transform -rotate-12 animate-[spin_20s_linear_infinite] hidden sm:flex">
              <svg className="w-full h-full text-primary absolute inset-0" viewBox="0 0 100 100">
                <path d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" id="curve"></path>
                <text className="text-[9.5px] tracking-widest uppercase font-semibold fill-current font-sans">
                  <textPath href="#curve" startOffset="0">100% ARTESANAL • 100% ARTESANAL •</textPath>
                </text>
              </svg>
              <Star className="w-5 h-5 text-primary fill-primary absolute" />
            </div>
          </div>
        </div>
      </header>

      {/* Quote Strip */}
      <section className="bg-dark-chocolate py-24 px-gutter text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-float"></div>
        <ScrollReveal animation="scaleUp" duration={1000} className="max-w-4xl mx-auto relative z-10">
          <Quote className="w-12 h-12 text-tertiary-container/30 mx-auto mb-6 block" />
          <blockquote className="font-headline-lg text-4xl md:text-5xl text-surface-bright italic font-light leading-snug mb-8">
            "La repostería es el lenguaje del cariño hecho azúcar. Cada detalle importa."
          </blockquote>
          <cite className="font-label-lg text-xs text-tertiary-container uppercase tracking-widest not-italic">
            — Paci
          </cite>
        </ScrollReveal>
      </section>

      {/* Catalog Component */}
      <Catalog />

      {/* Process Section */}
      <section className="py-24 px-gutter bg-surface-container-low border-y border-outline-variant/20" id="proceso">
        <div className="max-w-container-max mx-auto">
          <ScrollReveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-4xl md:text-5xl text-dark-chocolate mb-4">
                Nuestro Proceso
              </h2>
              <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">
                Cada creación lleva su tiempo y dedicación. Así trabajamos para hacer realidad tus ideas.
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-outline-variant/50"></div>
            
            {/* Step 1 */}
            <ScrollReveal delay={100} animation="fadeInUp" className="h-full">
              <div className="relative flex flex-col items-center text-center group h-full">
                <div className="w-24 h-24 rounded-full bg-surface-bright border-2 border-primary/20 flex items-center justify-center mb-6 z-10 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <span className="font-serif text-3xl text-primary font-medium">01</span>
                </div>
                <h3 className="font-headline-sm text-xl text-dark-chocolate mb-3">Consulta</h3>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                  Nos cuentas tu idea, temática, porciones y preferencias de sabor.
                </p>
              </div>
            </ScrollReveal>
            
            {/* Step 2 */}
            <ScrollReveal delay={200} animation="fadeInUp" className="h-full">
              <div className="relative flex flex-col items-center text-center group h-full">
                <div className="w-24 h-24 rounded-full bg-surface-bright border-2 border-primary/20 flex items-center justify-center mb-6 z-10 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <span className="font-serif text-3xl text-primary font-medium">02</span>
                </div>
                <h3 className="font-headline-sm text-xl text-dark-chocolate mb-3">Diseño</h3>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                  Creamos un boceto y presupuesto personalizado para tu aprobación.
                </p>
              </div>
            </ScrollReveal>
            
            {/* Step 3 */}
            <ScrollReveal delay={300} animation="fadeInUp" className="h-full">
              <div className="relative flex flex-col items-center text-center group h-full">
                <div className="w-24 h-24 rounded-full bg-surface-bright border-2 border-primary/20 flex items-center justify-center mb-6 z-10 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <span className="font-serif text-3xl text-primary font-medium">03</span>
                </div>
                <h3 className="font-headline-sm text-xl text-dark-chocolate mb-3">Elaboración</h3>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                  Horneamos y decoramos con ingredientes frescos y mucho detalle.
                </p>
              </div>
            </ScrollReveal>
            
            {/* Step 4 */}
            <ScrollReveal delay={400} animation="fadeInUp" className="h-full">
              <div className="relative flex flex-col items-center text-center group h-full">
                <div className="w-24 h-24 rounded-full bg-surface-bright border-2 border-primary/20 flex items-center justify-center mb-6 z-10 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <span className="font-serif text-3xl text-primary font-medium">04</span>
                </div>
                <h3 className="font-headline-sm text-xl text-dark-chocolate mb-3">Entrega</h3>
                <p className="text-on-surface-variant font-body-md text-sm leading-relaxed">
                  Tu pedido listo para ser el protagonista de tu celebración.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Videos of Process Section */}
      <section className="py-24 px-gutter bg-surface-bright border-b border-outline-variant/10" id="proceso-videos">
        <div className="max-w-container-max mx-auto">
          <ScrollReveal delay={100}>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-label-lg text-[10px] text-primary uppercase tracking-widest">
                  Detrás del Sabor
                </span>
              </div>
              <h2 className="font-display-lg text-4xl md:text-5xl text-dark-chocolate mb-4">
                El Arte en Movimiento
              </h2>
              <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">
                Te invitamos a ver de cerca los detalles, el romanticismo y la alta repostería que hay en la elaboración de nuestras tortas artísticas.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_VIDEOS.map((video, index) => (
              <ScrollReveal
                key={video.id}
                delay={index * 100}
                animation="fadeInUp"
                className="h-full"
              >
                <div 
                  onClick={() => setSelectedMedia(video)}
                  className="group flex flex-col bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/15 premium-card h-full cursor-pointer"
                >
                  {/* Video Player Container */}
                  <div className="aspect-video relative overflow-hidden bg-black">
                    <video
                      src={video.src}
                      loop
                      muted
                      playsInline
                      autoPlay
                      preload="auto"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-chocolate/30 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 z-10">
                      <div className="bg-surface-bright/90 backdrop-blur-md text-primary p-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                        <Maximize2 className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Video Description */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-headline-sm text-dark-chocolate mb-2 text-2xl group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-on-surface-variant font-body-md text-sm leading-relaxed flex-grow">
                      {video.subtitle}
                    </p>
                    <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider">
                      <span>Ver Proceso Completo</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Video Player Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark-chocolate/95 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setSelectedMedia(null)}
        >
          {/* Close button */}
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 text-surface-bright/80 hover:text-surface-bright transition-colors outline-none cursor-pointer p-2 rounded-full hover:bg-surface-bright/10 z-50"
            aria-label="Cerrar reproductor"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Modal Container */}
          <div 
            className="relative max-w-4xl w-full flex flex-col items-center justify-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black border border-outline-variant/10">
              <video
                src={selectedMedia.src}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Description Card */}
            <div className="mt-6 text-center max-w-2xl px-4">
              <h3 className="font-display-lg text-2xl md:text-3xl text-surface-bright mb-2">
                {selectedMedia.title}
              </h3>
              <p className="text-surface-bright/70 font-body-md text-sm md:text-base leading-relaxed">
                {selectedMedia.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <section className="py-24 px-gutter bg-dark-chocolate relative overflow-hidden" id="resenas">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary-container/15 rounded-full blur-3xl animate-float"></div>
        
        <div className="max-w-container-max mx-auto relative z-10">
          <ScrollReveal delay={100} animation="scaleUp">
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-4xl md:text-5xl text-surface-bright mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-tertiary-fixed-dim fill-tertiary-fixed-dim" />
                ))}
              </div>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <ScrollReveal delay={100} animation="fadeInUp" className="h-full">
              <div className="bg-surface-bright/5 border border-surface-bright/10 p-8 rounded-lg backdrop-blur-sm h-full flex flex-col justify-between hover:bg-surface-bright/10 transition-colors duration-300">
                <p className="text-surface-bright/80 font-body-md mb-6 leading-relaxed text-sm">
                  "La torta de mi boda fue un sueño hecho realidad. No solo era visualmente espectacular y elegante, sino que el sabor era de otro mundo. Totalmente recomendados."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-surface-bright font-serif text-xl">
                    V
                  </div>
                  <div>
                    <p className="text-surface-bright font-label-md uppercase tracking-wider text-xs font-semibold">Valentina R.</p>
                    <p className="text-surface-bright/60 text-xs">Torta de Matrimonio</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Review 2 */}
            <ScrollReveal delay={200} animation="fadeInUp" className="h-full">
              <div className="bg-surface-bright/5 border border-surface-bright/10 p-8 rounded-lg backdrop-blur-sm h-full flex flex-col justify-between hover:bg-surface-bright/10 transition-colors duration-300">
                <p className="text-surface-bright/80 font-body-md mb-6 leading-relaxed text-sm">
                  "Paci captó exactamente lo que quería para el cumpleaños de mi hija. Los detalles en fondant eran obras de arte y los cupcakes volaron. Volveré a pedir seguro."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-surface-bright font-serif text-xl">
                    C
                  </div>
                  <div>
                    <p className="text-surface-bright font-label-md uppercase tracking-wider text-xs font-semibold">Carolina M.</p>
                    <p className="text-surface-bright/60 text-xs">Mesa Dulce Infantil</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            
            {/* Review 3 */}
            <ScrollReveal delay={300} animation="fadeInUp" className="h-full">
              <div className="bg-surface-bright/5 border border-surface-bright/10 p-8 rounded-lg backdrop-blur-sm h-full flex flex-col justify-between hover:bg-surface-bright/10 transition-colors duration-300">
                <p className="text-surface-bright/80 font-body-md mb-6 leading-relaxed text-sm">
                  "Excelente atención desde el primer mensaje. Me guiaron en la elección de sabores y el resultado final superó mis expectativas. El Red Velvet es el mejor que he probado."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center text-surface-bright font-serif text-xl">
                    A
                  </div>
                  <div>
                    <p className="text-surface-bright font-label-md uppercase tracking-wider text-xs font-semibold">Andrés F.</p>
                    <p className="text-surface-bright/60 text-xs">Torta de Cumpleaños</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-gutter bg-surface-bright" id="faq">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal delay={100}>
            <div className="text-center mb-16">
              <h2 className="font-display-lg text-4xl md:text-5xl text-dark-chocolate mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-on-surface-variant font-body-md">
                Resolvemos tus dudas antes de hacer tu pedido.
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={200} animation="scaleUp">
            <div className="space-y-4">
              <AccordionItem
                question="¿Con cuánto tiempo de anticipación debo hacer mi pedido?"
                answer="Para tortas personalizadas solicitamos un mínimo de 15 días de anticipación. Para eventos grandes como bodas, sugerimos reservar con 2 a 3 meses de antelación para asegurar disponibilidad."
              />
              <AccordionItem
                question="¿Hacen envíos a domicilio?"
                answer="Sí, contamos con servicio de entrega especializado para garantizar que tu torta llegue en perfectas condiciones. El costo varía según la zona de entrega y volumen del pedido."
              />
              <AccordionItem
                question="¿Ofrecen opciones sin gluten o veganas?"
                answer="Actualmente ofrecemos una línea seleccionada de bizcochos sin gluten y opciones veganas en nuestro catálogo. Escríbenos en la sección de tortas personalizadas para conocer los sabores disponibles esta temporada."
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact & Custom Request Form Section */}
      <section className="py-24 px-gutter bg-surface-container-low" id="contacto">
        <div className="max-w-container-max mx-auto">
          <ScrollReveal delay={100} animation="fadeInUp">
            <div className="bg-surface-bright rounded-xl overflow-hidden shadow-md border border-outline-variant/20 flex flex-col md:flex-row">
              
              {/* Info Panel */}
              <div className="bg-primary/5 p-12 md:w-2/5 flex flex-col justify-between">
                <div>
                  <h2 className="font-display-lg text-4xl text-dark-chocolate mb-6">
                    Hagamos magia juntos
                  </h2>
                  <p className="text-on-surface-variant font-body-md mb-12 text-sm leading-relaxed">
                    Completa el formulario y nos pondremos en contacto contigo en un plazo de 24-48 horas para conversar sobre tu idea de torta ideal.
                  </p>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-label-lg uppercase tracking-wider text-xs font-semibold text-dark-chocolate mb-1">
                          Taller Privado
                        </h4>
                        <p className="text-on-surface-variant text-xs leading-normal">
                          Bogotá, Colombia
                          <br />
                          (Atención solo con cita previa)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-label-lg uppercase tracking-wider text-xs font-semibold text-dark-chocolate mb-1">
                          Email
                        </h4>
                        <p className="text-on-surface-variant text-xs">hola@paciscakes.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-label-lg uppercase tracking-wider text-xs font-semibold text-dark-chocolate mb-1">
                          WhatsApp
                        </h4>
                        <p className="text-on-surface-variant text-xs">+57 300 123 4567</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form Panel */}
              <div className="p-12 md:w-3/5">
                {successOrder ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-scale-up">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-5">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-display-lg text-2xl text-dark-chocolate mb-2">
                      ¡Solicitud Enviada!
                    </h3>
                    <p className="text-on-surface-variant font-body-md text-sm mb-6 max-w-sm">
                      Hola <strong>{successOrder.customerName}</strong>, hemos registrado tu solicitud de cotización. 
                      Guarda tu código para seguimiento en el sitio:
                    </p>
                    <div className="bg-surface-container-low border border-outline-variant/30 px-6 py-4 rounded-lg font-mono text-lg font-bold text-primary mb-6">
                      {successOrder.id}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href={`/pedidos/tracking?id=${successOrder.id}`}
                        className="bg-primary text-surface-bright px-6 py-3 rounded text-xs font-label-lg uppercase tracking-wider text-center"
                      >
                        Ver Seguimiento
                      </Link>
                      <button
                        onClick={() => setSuccessOrder(null)}
                        className="border border-outline-variant text-dark-chocolate px-6 py-3 rounded text-xs font-label-lg uppercase tracking-wider text-center cursor-pointer bg-transparent"
                      >
                        Enviar Otro
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-label-md uppercase tracking-wider text-xs font-medium text-dark-chocolate mb-2" htmlFor="name">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          placeholder="Tu nombre"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 text-sm text-dark-chocolate transition-colors placeholder:text-outline-variant/60 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-label-md uppercase tracking-wider text-xs font-medium text-dark-chocolate mb-2" htmlFor="phone">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          required
                          placeholder="Tu número de contacto"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 text-sm text-dark-chocolate transition-colors placeholder:text-outline-variant/60 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-label-md uppercase tracking-wider text-xs font-medium text-dark-chocolate mb-2" htmlFor="date">
                          Fecha del evento *
                        </label>
                        <input
                          type="date"
                          id="date"
                          required
                          value={contactDate}
                          onChange={(e) => setContactDate(e.target.value)}
                          className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 text-sm text-dark-chocolate transition-colors outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-label-md uppercase tracking-wider text-xs font-medium text-dark-chocolate mb-2" htmlFor="guests">
                          Nº de invitados (aprox)
                        </label>
                        <input
                          type="number"
                          id="guests"
                          placeholder="Ej: 50"
                          value={contactGuests}
                          onChange={(e) => setContactGuests(e.target.value)}
                          className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 text-sm text-dark-chocolate transition-colors placeholder:text-outline-variant/60 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-label-md uppercase tracking-wider text-xs font-medium text-dark-chocolate mb-2" htmlFor="message">
                        Cuéntanos tu idea
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Temática, sabores preferidos, colores de referencia, etc..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 text-sm text-dark-chocolate transition-colors placeholder:text-outline-variant/60 outline-none resize-none"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-surface-bright px-8 py-4 rounded hover:bg-on-primary-container disabled:bg-primary/50 transition-colors text-xs font-label-lg tracking-wider uppercase w-full md:w-auto mt-4 cursor-pointer"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />

      {/* Cart Drawer */}
      <CartSidebar />

      {/* Custom Cake Wizard */}
      <CustomCakeBuilder />
    </div>
  );
}
