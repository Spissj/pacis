"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/db";
import Link from "next/link";
import { Cake, X, Check } from "lucide-react";

const PORTIONS_OPTIONS = [
  { value: 10, label: "10 porciones (Pequeño)", price: 40000 },
  { value: 20, label: "20 porciones (Mediano)", price: 65000 },
  { value: 30, label: "30 porciones (Grande)", price: 85000 },
  { value: 50, label: "50 porciones (Familiar)", price: 135000 },
];

const SPONGE_OPTIONS = [
  { id: "vainilla", label: "Vainilla Clásica", description: "Húmeda y aromática con extracto natural" },
  { id: "chocolate", label: "Chocolate Intenso", description: "Esponjoso con cacao belga al 60%" },
  { id: "red_velvet", label: "Red Velvet", description: "Bizcocho de textura aterciopelada y ligero cacao" },
  { id: "zanahoria", label: "Zanahoria y Nuez", description: "Con especias dulces y trozos crujientes de nuez" },
];

const FILLING_OPTIONS = [
  { id: "arequipe", label: "Arequipe Premium", description: "Dulce de leche artesanal cremoso" },
  { id: "frutos_rojos", label: "Frutos Rojos", description: "Jalea casera de frambuesa, mora y arándano" },
  { id: "ganache", label: "Ganache de Chocolate", description: "Crema densa de chocolate oscuro" },
  { id: "queso_crema", label: "Suiza de Queso Crema", description: "Frosting suave con ligero toque cítrico" },
];

const COLOR_OPTIONS = [
  "Rosa Viejo",
  "Dorado Brillante",
  "Blanco Parchment",
  "Azul Pastel",
  "Verde Eucalipto",
  "Caramelo Cálido",
];

export default function CustomCakeBuilder() {
  const { isBuilderOpen, setIsBuilderOpen } = useCart();
  const [step, setStep] = useState(1);

  // Form States
  const [selectedPortions, setSelectedPortions] = useState(PORTIONS_OPTIONS[0]);
  const [selectedSponge, setSelectedSponge] = useState(SPONGE_OPTIONS[0].label);
  const [selectedFilling, setSelectedFilling] = useState(FILLING_OPTIONS[0].label);
  
  const [cakeText, setCakeText] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [designNotes, setDesignNotes] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [eventDate, setEventDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!isBuilderOpen) return null;

  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const calculateEstimate = () => {
    return selectedPortions.price;
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleClose = () => {
    setIsBuilderOpen(false);
    // Reset wizard
    setStep(1);
    setCreatedOrder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !eventDate) {
      alert("Por favor completa los campos requeridos (Nombre, Teléfono y Fecha).");
      return;
    }

    setIsSubmitting(true);

    try {
      const estimate = calculateEstimate();
      const newOrder = await createOrder({
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        eventDate,
        orderType: "custom",
        guestCount: selectedPortions.value,
        message: designNotes || undefined,
        totalPrice: estimate,
        customDetails: {
          portions: selectedPortions.value,
          spongeFlavor: selectedSponge,
          fillingFlavor: selectedFilling,
          cakeText: cakeText || "Sin mensaje",
          colors: selectedColors.length > 0 ? selectedColors : ["Blanco Parchment"],
          referenceImage: designNotes ? `Referencia: ${designNotes.substring(0, 30)}...` : undefined,
        },
      });

      setCreatedOrder(newOrder);

      // Reset Form fields
      setStep(5); // Show success step
      setCakeText("");
      setSelectedColors([]);
      setDesignNotes("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setEventDate("");
    } catch (e) {
      console.error(e);
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-chocolate/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-bright rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-outline-variant/20 relative animate-scale-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h2 className="font-display-lg text-2xl text-dark-chocolate flex items-center gap-2">
              <Cake className="w-6 h-6 text-primary" />
              Diseña tu Torta
            </h2>
            {step < 5 && (
              <p className="text-xs text-on-surface-variant mt-1">
                Paso {step} de 4 · Personaliza cada detalle de tu celebración
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        {step < 5 && (
          <div className="w-full bg-surface-container-low h-1.5">
            <div
              className="bg-primary h-1.5 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* STEP 1: PORTIONS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-headline-sm text-xl text-dark-chocolate">
                ¿Para cuántos invitados será tu torta?
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                El tamaño de la torta define las porciones estimadas. Selecciona una opción:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {PORTIONS_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setSelectedPortions(opt)}
                    className={`border p-5 rounded-lg cursor-pointer transition-all flex justify-between items-center ${
                      selectedPortions.value === opt.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-outline-variant/40 hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-dark-chocolate">{opt.label}</div>
                      <div className="text-xs text-on-surface-variant/80 mt-1">
                        Tamaño ideal para eventos
                      </div>
                    </div>
                    <div className="font-serif text-primary italic font-medium">
                      {formatPrice(opt.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: FLAVORS */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Sponge Selection */}
              <div>
                <h3 className="font-headline-sm text-lg text-dark-chocolate mb-3">
                  Sabor del Bizcocho
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPONGE_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedSponge(opt.label)}
                      className={`border p-4 rounded-lg cursor-pointer transition-all ${
                        selectedSponge === opt.label
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="font-semibold text-xs text-dark-chocolate">{opt.label}</div>
                      <div className="text-[10px] text-on-surface-variant/85 mt-1 leading-normal">
                        {opt.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filling Selection */}
              <div className="pt-4 border-t border-outline-variant/20">
                <h3 className="font-headline-sm text-lg text-dark-chocolate mb-3">
                  Sabor del Relleno
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FILLING_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedFilling(opt.label)}
                      className={`border p-4 rounded-lg cursor-pointer transition-all ${
                        selectedFilling === opt.label
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/40 hover:border-primary/40"
                      }`}
                    >
                      <div className="font-semibold text-xs text-dark-chocolate">{opt.label}</div>
                      <div className="text-[10px] text-on-surface-variant/85 mt-1 leading-normal">
                        {opt.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: STYLE & TEXT */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block font-headline-sm text-base text-dark-chocolate mb-2" htmlFor="custom-text">
                  Texto en la Torta (Opcional)
                </label>
                <input
                  type="text"
                  id="custom-text"
                  placeholder="Ej: ¡Feliz Cumpleaños Mamá! o Mis Dulces 15"
                  value={cakeText}
                  onChange={(e) => setCakeText(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2.5 text-sm text-dark-chocolate outline-none placeholder:text-on-surface-variant/40 transition-colors"
                />
              </div>

              <div>
                <span className="block font-headline-sm text-base text-dark-chocolate mb-3">
                  Gama de Colores Sugerida
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <div
                      key={color}
                      onClick={() => handleColorToggle(color)}
                      className={`border p-3.5 rounded-lg text-center text-xs font-medium cursor-pointer transition-all ${
                        selectedColors.includes(color)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline-variant/30 text-on-surface-variant hover:border-primary/45"
                      }`}
                    >
                      {color}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-headline-sm text-base text-dark-chocolate mb-2" htmlFor="custom-notes">
                  Detalles del Diseño / Temática
                </label>
                <textarea
                  id="custom-notes"
                  rows={3}
                  placeholder="Describe tu idea: estilo vintage, acuarela, flores naturales, detalles dorados, etc..."
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-2.5 text-sm text-dark-chocolate outline-none resize-none placeholder:text-on-surface-variant/40 transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 4: CONTACT & EVENT DETAILS */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
              <h3 className="font-headline-sm text-lg text-dark-chocolate">
                Datos de Contacto y Evento
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cust-name">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="cust-name"
                    required
                    placeholder="Tu nombre"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cust-phone">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="cust-phone"
                    required
                    placeholder="Ej: +57 300 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cust-email">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    id="cust-email"
                    placeholder="correo@ejemplo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cust-date">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    id="cust-date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Order Summary Recap */}
              <div className="bg-surface-container border border-outline-variant/25 p-5 rounded-lg space-y-3 mt-6">
                <div className="text-xs font-label-lg uppercase tracking-widest text-on-surface-variant pb-2 border-b border-outline-variant/10">
                  Resumen de tu Diseño
                </div>
                <div className="text-sm grid grid-cols-2 gap-2 text-on-surface-variant">
                  <div><strong>Tamaño:</strong> {selectedPortions.value} porciones</div>
                  <div><strong>Bizcocho:</strong> {selectedSponge}</div>
                  <div><strong>Relleno:</strong> {selectedFilling}</div>
                  <div><strong>Mensaje:</strong> {cakeText || "Ninguno"}</div>
                  <div className="col-span-2"><strong>Colores:</strong> {selectedColors.join(", ") || "Blanco Parchment"}</div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/15 mt-3">
                  <span className="font-label-lg uppercase tracking-wider text-xs text-dark-chocolate">Presupuesto Estimado</span>
                  <span className="font-serif text-xl font-bold text-primary">{formatPrice(calculateEstimate())}</span>
                </div>
                <div className="text-[10px] text-on-surface-variant/70 leading-relaxed">
                  * El precio final puede variar según la complejidad de la decoración y será confirmado por la pastelera tras revisar tu solicitud.
                </div>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && createdOrder && (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 animate-scale-up">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-display-lg text-3xl text-dark-chocolate mb-2">
                ¡Solicitud Enviada!
              </h3>
              <p className="text-on-surface-variant font-body-md text-sm mb-6 leading-relaxed">
                Hemos recibido tu solicitud de diseño personalizado para el <strong>{createdOrder.eventDate}</strong>. 
                Paci revisará los detalles y se contactará contigo para definir el diseño final.
              </p>
              <div className="bg-surface-container-low border border-outline-variant/35 p-5 rounded-lg mb-8 w-full max-w-sm">
                <div className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">
                  Código de Solicitud
                </div>
                <div className="font-mono text-xl font-bold text-primary tracking-wide">
                  {createdOrder.id}
                </div>
                <div className="text-xs text-on-surface-variant/70 mt-2">
                  Usa este código para consultar la aprobación y cotización final de tu diseño.
                </div>
              </div>
              
              <div className="space-y-3 w-full max-w-sm">
                <Link
                  href={`/pedidos/tracking?id=${createdOrder.id}`}
                  onClick={handleClose}
                  className="block w-full bg-primary text-surface-bright py-3.5 rounded hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider text-center"
                >
                  Seguir Solicitud
                </Link>
                <button
                  onClick={handleClose}
                  className="block w-full border border-outline-variant text-dark-chocolate py-3.5 rounded hover:bg-surface-container-low transition-colors text-xs font-label-lg uppercase tracking-wider text-center cursor-pointer"
                >
                  Regresar a la Página
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        {step < 5 && (
          <div className="p-6 border-t border-outline-variant/20 flex justify-between bg-surface-container-low/30">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="px-5 py-2.5 rounded border border-outline-variant text-dark-chocolate disabled:opacity-30 disabled:pointer-events-none hover:bg-surface-container-low transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer"
            >
              Atrás
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="bg-primary text-surface-bright px-5 py-2.5 rounded hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-surface-bright px-6 py-2.5 rounded hover:bg-on-primary-container disabled:bg-primary/50 transition-colors text-xs font-label-lg uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
