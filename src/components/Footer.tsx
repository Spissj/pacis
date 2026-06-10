import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-bright border-t border-outline-variant/20 pt-16 pb-8 px-gutter">
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className="h-14 w-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
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
          
          <div className="flex flex-wrap justify-center gap-8">
            <a href="#menu" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg uppercase tracking-widest text-xs">Menú</a>
            <a href="#proceso" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg uppercase tracking-widest text-xs">Proceso</a>
            <a href="#galeria" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg uppercase tracking-widest text-xs">Galería</a>
            <a href="#faq" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg uppercase tracking-widest text-xs">FAQ</a>
            <Link href="/pedidos/tracking" className="text-on-surface-variant hover:text-primary transition-colors font-label-lg uppercase tracking-widest text-xs">Seguimiento</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <a aria-label="Instagram" className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-surface-bright hover:border-primary transition-all" href="#">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583 0.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="text-center border-t border-outline-variant/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-on-surface-variant/60 font-body-md text-sm">© {new Date().getFullYear()} Paci's Cakes. Todos los derechos reservados.</p>
          <p className="text-on-surface-variant/60 font-body-md text-sm">Hecho con amor y dedicación artesanal</p>
        </div>
      </div>
    </footer>
  );
}
