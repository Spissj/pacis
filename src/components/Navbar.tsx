"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X } from "lucide-react";

export default function Navbar() {
  const { cartCount, setIsCartOpen, setIsBuilderOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 glass-nav border-b border-primary/10 transition-all duration-300 ${
        isScrolled ? "shadow-sm py-2" : "py-4"
      }`}
    >
      <div className="max-w-container-max mx-auto px-gutter flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className="h-10 w-auto">
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontFamily="var(--font-serif)"
              fontSize="38"
              fill="#3D1F0D"
              fontWeight="600"
              letterSpacing="-1"
            >
              Paci's Cakes
            </text>
            <path
              d="M90 52 Q150 62 210 52"
              stroke="#E8B4B8"
              strokeWidth="2.5"
              fill="none"
              opacity="0.8"
            />
          </svg>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#menu"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-lg text-xs uppercase tracking-widest"
          >
            Menú
          </a>
          <a
            href="#proceso"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-lg text-xs uppercase tracking-widest"
          >
            Proceso
          </a>
          <a
            href="#galeria"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-lg text-xs uppercase tracking-widest"
          >
            Galería
          </a>
          <a
            href="#resenas"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-lg text-xs uppercase tracking-widest"
          >
            Reseñas
          </a>
          <Link
            href="/pedidos/tracking"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-lg text-xs uppercase tracking-widest"
          >
            Seguimiento
          </Link>
          <Link
            href="/admin"
            className="text-on-surface-variant/70 hover:text-primary transition-colors duration-300 font-label-lg text-xs uppercase tracking-widest border-l border-dark-chocolate/10 pl-8"
          >
            Admin
          </Link>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-dark-chocolate hover:text-primary p-2 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-surface-bright">
                {cartCount}
              </span>
            )}
          </button>

          {/* CTA Custom Cake */}
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="hidden lg:inline-flex bg-primary text-surface-bright px-5 py-2.5 rounded hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer"
          >
            Diseñar Torta
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-on-surface p-2 cursor-pointer"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-surface-bright border-b border-outline-variant/20 shadow-lg animate-fade-in">
          <div className="flex flex-col p-5 gap-4">
            <a
              href="#menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-on-surface font-label-lg text-sm uppercase py-2 border-b border-outline-variant/10"
            >
              Menú
            </a>
            <a
              href="#proceso"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-on-surface font-label-lg text-sm uppercase py-2 border-b border-outline-variant/10"
            >
              Proceso
            </a>
            <a
              href="#galeria"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-on-surface font-label-lg text-sm uppercase py-2 border-b border-outline-variant/10"
            >
              Galería
            </a>
            <a
              href="#resenas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-on-surface font-label-lg text-sm uppercase py-2 border-b border-outline-variant/10"
            >
              Reseñas
            </a>
            <Link
              href="/pedidos/tracking"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-on-surface font-label-lg text-sm uppercase py-2 border-b border-outline-variant/10"
            >
              Seguimiento de Pedidos
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-on-surface font-label-lg text-sm uppercase py-2 border-b border-outline-variant/10"
            >
              Panel de Administrador
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsBuilderOpen(true);
              }}
              className="bg-primary text-surface-bright px-4 py-3 rounded text-center font-label-lg text-sm uppercase mt-2 w-full"
            >
              Diseñar Torta Personalizada
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
