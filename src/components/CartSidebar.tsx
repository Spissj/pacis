"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag, X, Check, Trash2 } from "lucide-react";

export default function CartSidebar() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!isCartOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date) {
      alert("Por favor, completa los campos requeridos (Nombre, Teléfono y Fecha).");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const newOrder = await createOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
        eventDate: date,
        orderType: "catalog",
        items: orderItems,
        message: message || undefined,
        totalPrice: cartTotal,
      });

      setCreatedOrder(newOrder);
      clearCart();
      
      // Reset form fields
      setName("");
      setPhone("");
      setEmail("");
      setDate("");
      setMessage("");
    } catch (e) {
      console.error(e);
      alert("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-dark-chocolate/35 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => {
          if (!createdOrder) {
            setIsCartOpen(false);
          }
        }}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-bright border-l border-outline-variant/20 shadow-2xl flex flex-col justify-between h-full">
          {/* Header */}
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <h2 className="font-display-lg text-2xl text-dark-chocolate flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Tu Pedido
            </h2>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setCreatedOrder(null);
              }}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center animate-fade-in"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Success Screen */}
          {createdOrder ? (
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 animate-scale-up">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-display-lg text-3xl text-dark-chocolate mb-2">
                ¡Pedido Recibido!
              </h3>
              <p className="text-on-surface-variant font-body-md text-sm mb-6 leading-relaxed">
                Gracias por elegir Paci's Cakes, <strong>{createdOrder.customerName}</strong>. 
                Tu pedido ha sido registrado con éxito. Nos pondremos en contacto contigo pronto.
              </p>
              <div className="bg-surface-container-low border border-outline-variant/35 p-5 rounded-lg mb-8 w-full">
                <div className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">
                  Código de Seguimiento
                </div>
                <div className="font-mono text-xl font-bold text-primary tracking-wide">
                  {createdOrder.id}
                </div>
                <div className="text-xs text-on-surface-variant/70 mt-2">
                  Guarda este código para consultar el estado de tu pedido en tiempo real.
                </div>
              </div>
              
              <div className="space-y-3 w-full">
                <Link
                  href={`/pedidos/tracking?id=${createdOrder.id}`}
                  onClick={() => {
                    setIsCartOpen(false);
                    setCreatedOrder(null);
                  }}
                  className="block w-full bg-primary text-surface-bright py-3.5 rounded hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider text-center"
                >
                  Seguir Pedido
                </Link>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCreatedOrder(null);
                  }}
                  className="block w-full border border-outline-variant text-dark-chocolate py-3.5 rounded hover:bg-surface-container-low transition-colors text-xs font-label-lg uppercase tracking-wider text-center cursor-pointer"
                >
                  Seguir Navegando
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty State */
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-12 h-12 text-on-surface-variant/40 mb-4 mx-auto" />
              <p className="text-on-surface-variant font-body-md">
                Tu carrito está vacío.
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-1 max-w-[200px]">
                Explora nuestras creaciones y añade tus favoritas.
              </p>
            </div>
          ) : (
            /* Cart Items & Checkout Form */
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Item List */}
              <div className="space-y-4">
                <div className="text-xs font-label-lg uppercase tracking-widest text-on-surface-variant mb-2">
                  Productos Seleccionados
                </div>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 items-center bg-surface-container-low/50 border border-outline-variant/10 p-3 rounded"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline-sm text-base text-dark-chocolate truncate leading-tight mb-1">
                        {item.product.name}
                      </h4>
                      <p className="font-serif text-primary text-xs italic">
                        {formatPrice(item.product.price)} c/u
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2.5 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-outline-variant/40 flex items-center justify-center hover:border-primary text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold text-dark-chocolate w-5 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-outline-variant/40 flex items-center justify-center hover:border-primary text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-on-surface-variant/50 hover:text-error transition-colors cursor-pointer p-2 flex items-center justify-center"
                      aria-label="Quitar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmit} className="space-y-4 border-t border-outline-variant/20 pt-6">
                <div className="text-xs font-label-lg uppercase tracking-widest text-on-surface-variant mb-2">
                  Datos de Entrega / Contacto
                </div>
                
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cart-name">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="cart-name"
                    required
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cart-phone">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="cart-phone"
                    required
                    placeholder="Ej: +57 300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cart-email">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    id="cart-email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cart-date">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    id="cart-date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="cart-msg">
                    Instrucciones Especiales / Notas
                  </label>
                  <textarea
                    id="cart-msg"
                    rows={2}
                    placeholder="Ej: Mensaje personalizado, alergias, horario de entrega preferido..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-dark-chocolate focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>
                
                {/* Total & Submit */}
                <div className="border-t border-outline-variant/20 pt-6 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-label-lg uppercase tracking-wider text-sm text-dark-chocolate">Total del Pedido</span>
                    <span className="font-serif text-2xl font-bold text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-surface-bright py-4 rounded hover:bg-on-primary-container disabled:bg-primary/50 transition-colors text-xs font-label-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-surface-bright"></div>
                        Procesando...
                      </>
                    ) : (
                      "Confirmar Pedido"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
