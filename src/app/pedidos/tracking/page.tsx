"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/db";
import { Order } from "@/lib/seed";
import { ArrowLeft, Hash, AlertCircle, Check, Cookie } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending", label: "Recibido", desc: "Su solicitud está siendo revisada" },
  { key: "approved", label: "Aprobado", desc: "Pedido confirmado" },
  { key: "production", label: "En Cocina", desc: "Preparando su pedido con amor" },
  { key: "ready", label: "Listo", desc: "Preparado para entrega o retiro" },
  { key: "delivered", label: "Entregado", desc: "Disfrutado en su celebración" },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdQuery = searchParams.get("id") || "";

  const [orderId, setOrderId] = useState(orderIdQuery);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (orderIdQuery) {
      handleSearch(orderIdQuery);
    }
  }, [orderIdQuery]);

  const handleSearch = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError("");
    setSearched(true);
    
    try {
      const found = await getOrderById(id.trim());
      if (found) {
        setOrder(found);
      } else {
        setOrder(null);
        setError("No encontramos ningún pedido con el código ingresado.");
      }
    } catch (e) {
      console.error(e);
      setError("Error al buscar el pedido. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: Order["status"]) => {
    if (status === "cancelled") return -1;
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-gutter">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary mb-8 transition-colors uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Inicio
      </Link>

      {/* Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-display-lg text-4xl text-dark-chocolate mb-2 font-normal">
          Seguimiento de Pedidos
        </h1>
        <p className="text-sm text-on-surface-variant">
          Ingresa tu código de pedido para consultar el estado de preparación en tiempo real.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm mb-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/pedidos/tracking?id=${orderId.trim()}`);
          }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="Código de Pedido (Ej: PC-9531)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-4 pr-10 py-3 text-sm text-dark-chocolate placeholder:text-on-surface-variant/40 outline-none uppercase font-mono tracking-widest transition-colors"
            />
            <Hash className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none w-5 h-5" />
          </div>
          <button
            type="submit"
            className="bg-primary text-surface-bright px-8 py-3 rounded-lg hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer font-semibold"
          >
            Buscar Pedido
          </button>
        </form>
      </div>

      {/* Results Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-surface-container-low border border-outline-variant/10 rounded-xl">
          <AlertCircle className="w-12 h-12 text-error mb-3 mx-auto" />
          <p className="text-on-surface-variant text-sm font-medium">{error}</p>
        </div>
      ) : order ? (
        <div className="space-y-8 animate-fade-in">
          {/* Order Details Header */}
          <div className="bg-surface-container border border-outline-variant/20 p-6 rounded-xl flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <div className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-1">
                Código del Pedido
              </div>
              <div className="font-mono text-2xl font-bold text-dark-chocolate tracking-wide mb-3">
                {order.id}
              </div>
              <div className="text-sm text-on-surface-variant">
                <strong>Cliente:</strong> {order.customerName}
              </div>
              <div className="text-sm text-on-surface-variant mt-1">
                <strong>Fecha del Evento:</strong> {order.eventDate}
              </div>
            </div>
            <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    order.status === "cancelled"
                      ? "bg-error-container text-on-error-container"
                      : order.status === "delivered"
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-tertiary-container/20 text-tertiary border border-tertiary-container/40"
                  }`}
                >
                  {order.status === "pending"
                    ? "Pendiente de Aprobación"
                    : order.status === "approved"
                    ? "Aprobado"
                    : order.status === "production"
                    ? "En Cocina"
                    : order.status === "ready"
                    ? "Listo para Entrega"
                    : order.status === "delivered"
                    ? "Entregado"
                    : "Cancelado"}
                </span>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant/80 mb-0.5">
                  Total
                </div>
                <div className="font-serif text-xl font-bold text-primary">
                  {formatPrice(order.totalPrice)}
                </div>
              </div>
            </div>
          </div>

          {/* Cancelled State banner */}
          {order.status === "cancelled" && (
            <div className="p-4 bg-error-container/20 border border-error/25 rounded-lg text-error text-sm text-center">
              Este pedido ha sido cancelado. Si tienes dudas, por favor contáctanos por WhatsApp.
            </div>
          )}

          {/* Progress Timeline */}
          {order.status !== "cancelled" && (
            <div className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-xl shadow-sm">
              <h3 className="font-headline-sm text-xl text-dark-chocolate mb-8">
                Progreso de Preparación
              </h3>
              
              <div className="relative pl-6 border-l-2 border-outline-variant/30 space-y-8 ml-2">
                {STATUS_STEPS.map((stepInfo, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  
                  return (
                    <div key={stepInfo.key} className="relative">
                      {/* Timeline Indicator Circle */}
                      <span
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary border-primary text-white"
                            : isCurrent
                            ? "bg-surface-bright border-primary animate-pulse"
                            : "bg-surface-bright border-outline-variant/60"
                        }`}
                      >
                        {isCompleted && (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        )}
                      </span>
                      
                      {/* Step Text */}
                      <div className="pl-4">
                        <h4
                          className={`font-semibold text-sm transition-colors ${
                            isCurrent
                              ? "text-primary text-base"
                              : isCompleted
                              ? "text-dark-chocolate"
                              : "text-on-surface-variant/50"
                          }`}
                        >
                          {stepInfo.label}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrent
                              ? "text-on-surface-variant"
                              : isCompleted
                              ? "text-on-surface-variant/80"
                              : "text-on-surface-variant/40"
                          }`}
                        >
                          {stepInfo.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary breakdown */}
          <div className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-xl shadow-sm">
            <h3 className="font-headline-sm text-xl text-dark-chocolate mb-6 border-b border-outline-variant/20 pb-4">
              Detalles del Pedido
            </h3>
            
            {order.orderType === "catalog" ? (
              /* Catalog items */
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <div>
                      <div className="font-medium text-sm text-dark-chocolate">
                        {item.name}
                      </div>
                      <div className="text-xs text-on-surface-variant/70 mt-0.5">
                        {item.quantity} unidad(es) · {formatPrice(item.price)} c/u
                      </div>
                    </div>
                    <div className="font-serif text-sm font-semibold text-dark-chocolate">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Custom cake builder items */
              <div className="space-y-4 text-sm text-on-surface-variant">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <span className="block text-xs text-on-surface-variant/60">Tipo de Producto</span>
                    <span className="font-medium text-dark-chocolate">Torta Diseñada a Medida</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant/60">Porciones Estimadas</span>
                    <span className="font-medium text-dark-chocolate">{order.customDetails?.portions} porciones</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant/60">Sabor de Bizcocho</span>
                    <span className="font-medium text-dark-chocolate">{order.customDetails?.spongeFlavor}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant/60">Sabor de Relleno</span>
                    <span className="font-medium text-dark-chocolate">{order.customDetails?.fillingFlavor}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-on-surface-variant/60">Gama de Colores</span>
                    <span className="font-medium text-dark-chocolate">{order.customDetails?.colors.join(", ")}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-on-surface-variant/60">Mensaje en la Torta</span>
                    <span className="font-medium italic text-primary">"{order.customDetails?.cakeText}"</span>
                  </div>
                </div>
              </div>
            )}

            {/* General message / notes */}
            {order.message && (
              <div className="mt-6 pt-6 border-t border-outline-variant/15 text-xs text-on-surface-variant">
                <strong>Notas de entrega / diseño:</strong>
                <p className="mt-1 leading-relaxed bg-surface-bright/80 p-3.5 rounded border border-outline-variant/10">
                  {order.message}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : searched && (
        <div className="text-center py-12 bg-surface-container-low border border-outline-variant/10 rounded-xl">
          <Cookie className="w-12 h-12 text-on-surface-variant/50 mb-3 mx-auto" />
          <p className="text-on-surface-variant text-sm font-medium">Buscando pedido...</p>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center bg-surface-bright">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <div className="min-h-screen bg-surface-bright pb-16">
        <TrackingContent />
      </div>
    </Suspense>
  );
}
