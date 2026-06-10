"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/lib/seed";
import { getProducts } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { Search, Cookie, X } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "creaciones", label: "Creaciones" },
];

export default function Catalog() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load products from Database wrapper
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getProducts();
      // Filter active products only
      const activeData = data.filter((p) => p.active);
      setProducts(activeData);
      setFilteredProducts(activeData);
      setIsLoading(false);
    }
    load();
  }, []);

  // Handle filtering
  useEffect(() => {
    let result = products;

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(result);
  }, [activeCategory, searchQuery, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-24 px-gutter bg-surface-bright" id="menu">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display-lg text-4xl md:text-5xl text-dark-chocolate mb-4">
            Nuestras Creaciones
          </h2>
          <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">
            Explora nuestra selección de postres artesanales, diseñados para
            cautivar a primera vista y enamorar al primer bocado.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-outline-variant/20 pb-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full border text-xs font-label-md uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "border-primary text-primary bg-primary/5 font-semibold"
                    : "border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Buscar delicias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-4 pr-10 py-2.5 text-sm text-dark-chocolate placeholder:text-on-surface-variant/50 outline-none transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none w-5 h-5" />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Cookie className="w-12 h-12 text-on-surface-variant/40 mb-3 mx-auto block" />
            <p className="text-on-surface-variant">
              No encontramos productos que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                {/* Product Image */}
                <div 
                  onClick={() => setSelectedProduct(product)}
                  className="aspect-[4/5] overflow-hidden mb-6 bg-surface-container-low rounded cursor-pointer relative"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-dark-chocolate/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-surface-bright/95 text-dark-chocolate px-4 py-2 rounded text-xs font-label-md uppercase tracking-wider shadow">
                      Ver Detalles
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <h3 
                  onClick={() => setSelectedProduct(product)}
                  className="font-headline-sm text-dark-chocolate mb-2 text-2xl hover:text-primary cursor-pointer transition-colors"
                >
                  {product.name}
                </h3>
                <p className="text-on-surface-variant font-body-md mb-4 flex-grow line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
                  <span className="font-serif text-lg text-primary italic font-medium">
                    Desde {formatPrice(product.price)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="text-dark-chocolate hover:text-primary font-label-md uppercase tracking-wider underline-hover pb-1 text-sm cursor-pointer"
                  >
                    Encargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-chocolate/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-bright rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl border border-outline-variant/20 relative animate-scale-up">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-surface-bright/90 shadow flex items-center justify-center text-dark-chocolate hover:text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Modal Left: Image */}
              <div className="md:w-1/2 aspect-square md:aspect-auto md:h-[400px] bg-surface-container-low">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Modal Right: Details */}
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-label-md text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest inline-block mb-3">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-headline-sm text-dark-chocolate text-3xl mb-3 leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-on-surface-variant font-body-md text-sm mb-6 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div>
                  <div className="text-2xl font-serif text-primary italic font-medium mb-5 border-t border-outline-variant/20 pt-4">
                    {formatPrice(selectedProduct.price)}
                  </div>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-primary text-surface-bright py-3.5 rounded hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer"
                  >
                    Añadir al Pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
