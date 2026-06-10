"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getOrders, getProducts, updateOrderStatus, saveProduct, deleteProduct } from "@/lib/db";
import { Order, Product } from "@/lib/seed";
import { X } from "lucide-react";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"stats" | "orders" | "menu">("stats");
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal / Form States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrderPrice, setEditingOrderPrice] = useState<number>(0);
  const [editingOrderNotes, setEditingOrderNotes] = useState<string>("");
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCat, setProdCat] = useState<Product["category"]>("tortas");
  const [prodImg, setProdImg] = useState("");
  const [prodActive, setProdActive] = useState(true);

  // Check login state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("pacis_admin_auth");
      if (auth === "true") {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // Fetch orders and products when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allOrders, allProducts] = await Promise.all([getOrders(), getProducts()]);
      setOrders(allOrders);
      setProducts(allProducts);
    } catch (e) {
      console.error("Error loading admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pacis_admin_auth", "true");
      }
    } else {
      alert("Contraseña incorrecta. Pista: admin123");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("pacis_admin_auth");
    }
  };

  // Status handlers
  const handleUpdateStatus = async (orderId: string, status: Order["status"]) => {
    const updated = await updateOrderStatus(orderId, status);
    if (updated) {
      // Refresh list
      loadData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  const handleSaveOrderChanges = async () => {
    if (!selectedOrder) return;
    const updated = await updateOrderStatus(
      selectedOrder.id,
      selectedOrder.status,
      editingOrderNotes,
      editingOrderPrice
    );
    if (updated) {
      alert("Cambios guardados con éxito.");
      loadData();
      setSelectedOrder(null);
    }
  };

  // Product actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodImg) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      category: prodCat,
      image: prodImg,
      active: prodActive,
    };

    await saveProduct(payload);
    alert(editingProduct ? "Producto editado." : "Producto añadido.");
    
    // Reset form
    setEditingProduct(null);
    setIsAddingProduct(false);
    resetProductForm();
    loadData();
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price.toString());
    setProdCat(product.category);
    setProdImg(product.image);
    setProdActive(product.active);
    setIsAddingProduct(true);
  };

  const handleDeleteProductClick = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      await deleteProduct(id);
      loadData();
    }
  };

  const resetProductForm = () => {
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdCat("tortas");
    setProdImg("");
    setProdActive(true);
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setEditingOrderPrice(order.totalPrice);
    setEditingOrderNotes(order.internalNotes || "");
  };

  // Math stats helpers
  const statsRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const statsPending = orders.filter((o) => o.status === "pending").length;
  const statsProduction = orders.filter((o) => o.status === "production").length;
  const statsReady = orders.filter((o) => o.status === "ready").length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface-bright flex items-center justify-center p-4">
        <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-xl max-w-sm w-full shadow-lg">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className="h-12 w-auto mx-auto mb-4">
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="42" fill="#3D1F0D" fontWeight="600" letterSpacing="-1">Paci's Cakes</text>
              <path d="M100 55 Q150 65 200 55" stroke="#E8B4B8" strokeWidth="2" fill="none" opacity="0.6"/>
            </svg>
            <h1 className="font-display-lg text-2xl text-dark-chocolate">Panel de Administración</h1>
            <p className="text-xs text-on-surface-variant mt-1">Ingresa la clave para acceder</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="admin-pwd">
                Contraseña
              </label>
              <input
                type="password"
                id="admin-pwd"
                required
                placeholder="Clave (Pista: admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-surface-bright py-3 rounded-lg hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer"
            >
              Iniciar Sesión
            </button>
            
            <Link
              href="/"
              className="block text-center text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors pt-2"
            >
              Regresar al sitio público
            </Link>
          </form>
        </div>
      </div>
    );
  }

  // LOGGED IN ADMIN PANEL
  return (
    <div className="min-h-screen bg-surface-bright pb-16 flex flex-col">
      {/* Top Admin Nav */}
      <nav className="bg-surface-container-low border-b border-outline-variant/20 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className="h-10 w-auto">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="38" fill="#3D1F0D" fontWeight="600" letterSpacing="-1">Paci's Cakes</text>
            <path d="M90 52 Q150 62 210 52" stroke="#E8B4B8" strokeWidth="2.5" fill="none" opacity="0.8"/>
          </svg>
          <span className="text-[10px] font-label-md uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full hidden sm:inline-block">
            Modo Administrador
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider"
          >
            Ver Sitio
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-error hover:text-error/85 transition-colors uppercase tracking-wider cursor-pointer border border-error/20 hover:bg-error/5 px-3 py-1.5 rounded"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Main Admin Section */}
      <div className="max-w-container-max mx-auto px-gutter py-10 w-full flex-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/25 mb-10 gap-6">
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-4 text-xs font-label-lg uppercase tracking-wider cursor-pointer relative ${
              activeTab === "stats" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Dashboard
            {activeTab === "stats" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
          
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-xs font-label-lg uppercase tracking-wider cursor-pointer relative ${
              activeTab === "orders" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Pedidos ({orders.length})
            {activeTab === "orders" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`pb-4 text-xs font-label-lg uppercase tracking-wider cursor-pointer relative ${
              activeTab === "menu" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Administrar Menú
            {activeTab === "menu" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* TAB content */}
        {!isLoading && (
          <>
            {/* TAB 1: DASHBOARD STATS */}
            {activeTab === "stats" && (
              <div className="space-y-10 animate-fade-in">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm">
                    <span className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                      Ventas Totales
                    </span>
                    <div className="font-serif text-3xl font-bold text-dark-chocolate">
                      {formatPrice(statsRevenue)}
                    </div>
                    <span className="text-[10px] text-primary/75 mt-1 block">Excluye pedidos cancelados</span>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm">
                    <span className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                      Pendientes
                    </span>
                    <div className="font-serif text-3xl font-bold text-dark-chocolate">
                      {statsPending}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">Requieren revisión</span>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm">
                    <span className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                      En Cocina
                    </span>
                    <div className="font-serif text-3xl font-bold text-dark-chocolate">
                      {statsProduction}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">En preparación activa</span>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm">
                    <span className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                      Listos para Entrega
                    </span>
                    <div className="font-serif text-3xl font-bold text-dark-chocolate">
                      {statsReady}
                    </div>
                    <span className="text-[10px] text-on-surface-variant/70 mt-1 block">Esperando retiro/despacho</span>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 shadow-sm">
                  <h3 className="font-headline-sm text-xl text-dark-chocolate mb-4 border-b border-outline-variant/10 pb-3">
                    Pedidos Recientes
                  </h3>
                  
                  {orders.length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-4 text-center">No hay pedidos registrados.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((o) => (
                        <div
                          key={o.id}
                          onClick={() => openOrderModal(o)}
                          className="flex justify-between items-center p-4 border border-outline-variant/10 rounded-lg hover:border-primary/40 cursor-pointer bg-surface-bright/50 transition-colors"
                        >
                          <div>
                            <span className="font-mono text-xs font-bold text-primary block">{o.id}</span>
                            <span className="font-medium text-sm text-dark-chocolate mt-0.5 inline-block">{o.customerName}</span>
                            <span className="text-xs text-on-surface-variant/70 block sm:inline-block sm:ml-4">
                              {o.orderType === "custom" ? "Torta Personalizada" : "Catálogo"} · {o.eventDate}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <span className="font-serif text-sm font-semibold text-dark-chocolate block">{formatPrice(o.totalPrice)}</span>
                            <span className="text-[10px] uppercase font-semibold text-primary/80 mt-1 inline-block">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS MANAGEMENT */}
            {activeTab === "orders" && (
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-surface-container text-dark-chocolate font-label-lg text-xs uppercase tracking-wider border-b border-outline-variant/20">
                        <th className="py-4 px-6">Código</th>
                        <th className="py-4 px-6">Cliente</th>
                        <th className="py-4 px-6">Fecha Evento</th>
                        <th className="py-4 px-6">Tipo</th>
                        <th className="py-4 px-6 text-right">Total</th>
                        <th className="py-4 px-6">Estado</th>
                        <th className="py-4 px-6 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-6 font-mono text-xs font-bold text-primary">{o.id}</td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-dark-chocolate">{o.customerName}</div>
                            <div className="text-xs text-on-surface-variant/70">{o.customerPhone}</div>
                          </td>
                          <td className="py-4 px-6 text-xs text-on-surface-variant">{o.eventDate}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              o.orderType === "custom" ? "bg-tertiary-container/30 text-tertiary" : "bg-primary-container/20 text-on-primary-container"
                            }`}>
                              {o.orderType === "custom" ? "Personalizada" : "Catálogo"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-serif font-semibold text-dark-chocolate">
                            {formatPrice(o.totalPrice)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${
                              o.status === "pending" ? "text-tertiary" :
                              o.status === "production" ? "text-primary" :
                              o.status === "ready" ? "text-[#25D366]" :
                              o.status === "delivered" ? "text-primary/70" : "text-error"
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => openOrderModal(o)}
                              className="text-xs bg-surface-bright hover:bg-primary hover:text-white border border-outline-variant/50 transition-colors px-3 py-1.5 rounded cursor-pointer font-medium"
                            >
                              Administrar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MENU CRUD MANAGER */}
            {activeTab === "menu" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-sm text-xl text-dark-chocolate">Gestión de Catálogo</h3>
                  {!isAddingProduct && (
                    <button
                      onClick={() => {
                        resetProductForm();
                        setIsAddingProduct(true);
                      }}
                      className="bg-primary text-surface-bright px-4 py-2 rounded text-xs font-label-lg uppercase tracking-wider cursor-pointer"
                    >
                      Añadir Producto
                    </button>
                  )}
                </div>

                {isAddingProduct ? (
                  /* Add/Edit Form */
                  <form onSubmit={handleSaveProduct} className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-xl shadow-sm space-y-6 max-w-xl">
                    <h4 className="font-headline-sm text-lg text-dark-chocolate border-b border-outline-variant/10 pb-3">
                      {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="prod-name">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          id="prod-name"
                          required
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="prod-price">
                          Precio de Base *
                        </label>
                        <input
                          type="number"
                          id="prod-price"
                          required
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="prod-cat">
                          Categoría *
                        </label>
                        <select
                          id="prod-cat"
                          value={prodCat}
                          onChange={(e) => setProdCat(e.target.value as any)}
                          className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none"
                        >
                          <option value="tortas">Tortas</option>
                          <option value="cupcakes">Cupcakes</option>
                          <option value="galletas">Galletas</option>
                          <option value="especiales">Especiales</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="prod-img">
                          URL de Imagen *
                        </label>
                        <input
                          type="text"
                          id="prod-img"
                          required
                          value={prodImg}
                          onChange={(e) => setProdImg(e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5" htmlFor="prod-desc">
                        Descripción
                      </label>
                      <textarea
                        id="prod-desc"
                        rows={3}
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="prod-active"
                        checked={prodActive}
                        onChange={(e) => setProdActive(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor="prod-active" className="text-xs text-dark-chocolate font-semibold cursor-pointer">
                        Producto Activo (Mostrar en el catálogo público)
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                          resetProductForm();
                        }}
                        className="px-4 py-2 border border-outline-variant rounded text-xs font-label-lg uppercase tracking-wider cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-surface-bright px-5 py-2 rounded text-xs font-label-lg uppercase tracking-wider cursor-pointer"
                      >
                        Guardar Producto
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Products Table List */
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-surface-container text-dark-chocolate font-label-lg text-xs uppercase tracking-wider border-b border-outline-variant/20">
                            <th className="py-4 px-6 w-20">Foto</th>
                            <th className="py-4 px-6">Producto</th>
                            <th className="py-4 px-6">Categoría</th>
                            <th className="py-4 px-6 text-right">Precio</th>
                            <th className="py-4 px-6 text-center">Estado</th>
                            <th className="py-4 px-6 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {products.map((p) => (
                            <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                              <td className="py-4 px-6">
                                <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-semibold text-dark-chocolate">{p.name}</div>
                                <div className="text-xs text-on-surface-variant/80 line-clamp-1 max-w-sm">{p.description}</div>
                              </td>
                              <td className="py-4 px-6 text-xs text-on-surface-variant uppercase font-medium">{p.category}</td>
                              <td className="py-4 px-6 text-right font-serif font-semibold text-dark-chocolate">{formatPrice(p.price)}</td>
                              <td className="py-4 px-6 text-center">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${p.active ? "bg-[#25D366]" : "bg-outline"}`} title={p.active ? "Activo" : "Inactivo"}></span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleEditProductClick(p)}
                                    className="text-xs bg-surface-bright border border-outline-variant/50 hover:border-primary hover:text-primary px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProductClick(p.id)}
                                    className="text-xs border border-error/20 bg-error/5 hover:bg-error hover:text-white text-error px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                                  >
                                    Borrar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* DETAIL AND EDIT STATUS MODAL FOR ORDERS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-chocolate/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-bright rounded-xl max-w-xl w-full overflow-hidden shadow-2xl border border-outline-variant/20 relative animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{selectedOrder.id}</span>
                <h3 className="font-display-lg text-2xl text-dark-chocolate mt-0.5">Administrar Pedido</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-label-lg text-xs uppercase tracking-widest text-on-surface-variant mb-2">Información del Cliente</h4>
                <div className="bg-surface-container-low/50 p-4 rounded border border-outline-variant/10 text-sm space-y-1 text-on-surface-variant">
                  <div><strong>Nombre:</strong> {selectedOrder.customerName}</div>
                  <div><strong>Teléfono:</strong> {selectedOrder.customerPhone}</div>
                  {selectedOrder.customerEmail && <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>}
                  <div><strong>Fecha de Entrega:</strong> {selectedOrder.eventDate}</div>
                </div>
              </div>

              {/* Order breakdown */}
              <div>
                <h4 className="font-label-lg text-xs uppercase tracking-widest text-on-surface-variant mb-2">Artículos del Pedido</h4>
                {selectedOrder.orderType === "catalog" ? (
                  /* Catalog items */
                  <div className="space-y-2 bg-surface-container-low/50 p-4 rounded border border-outline-variant/10">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{item.name} <span className="text-xs text-on-surface-variant/75">(x{item.quantity})</span></span>
                        <span className="font-mono font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Custom cake details */
                  <div className="bg-surface-container-low/50 p-4 rounded border border-outline-variant/10 text-sm space-y-2 text-on-surface-variant">
                    <div><strong>Tipo:</strong> Torta Personalizada</div>
                    <div><strong>Porciones:</strong> {selectedOrder.customDetails?.portions} porciones</div>
                    <div><strong>Bizcocho:</strong> {selectedOrder.customDetails?.spongeFlavor}</div>
                    <div><strong>Relleno:</strong> {selectedOrder.customDetails?.fillingFlavor}</div>
                    <div><strong>Mensaje:</strong> <span className="italic text-primary">"{selectedOrder.customDetails?.cakeText}"</span></div>
                    <div><strong>Gama de Colores:</strong> {selectedOrder.customDetails?.colors.join(", ")}</div>
                  </div>
                )}
              </div>

              {/* Message from client */}
              {selectedOrder.message && (
                <div>
                  <h4 className="font-label-lg text-xs uppercase tracking-widest text-on-surface-variant mb-1.5">Instrucciones del Cliente</h4>
                  <p className="text-xs bg-surface-container-low/50 p-3 rounded border border-outline-variant/15 text-on-surface-variant italic">
                    "{selectedOrder.message}"
                  </p>
                </div>
              )}

              {/* Admin modifications (Price & Notes) */}
              <div className="border-t border-outline-variant/20 pt-4 space-y-4">
                <h4 className="font-label-lg text-xs uppercase tracking-widest text-on-surface-variant">Edición Administrativa</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5">
                      Precio de Venta ($ COP)
                    </label>
                    <input
                      type="number"
                      value={editingOrderPrice}
                      onChange={(e) => setEditingOrderPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5">
                      Estado del Pedido
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                      className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none"
                    >
                      <option value="pending">Pendiente (pending)</option>
                      <option value="approved">Aprobado (approved)</option>
                      <option value="production">En Cocina (production)</option>
                      <option value="ready">Listo para Entrega (ready)</option>
                      <option value="delivered">Entregado (delivered)</option>
                      <option value="cancelled">Cancelado (cancelled)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5">
                    Notas Internas / Bitácora
                  </label>
                  <textarea
                    rows={2}
                    value={editingOrderNotes}
                    onChange={(e) => setEditingOrderNotes(e.target.value)}
                    className="w-full bg-surface-bright border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary rounded px-3 py-2 text-sm outline-none resize-none"
                    placeholder="Notas visibles solo para administradores..."
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons for Order Modal */}
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container-low/30">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-outline-variant rounded text-xs font-label-lg uppercase tracking-wider cursor-pointer"
              >
                Cerrar sin guardar
              </button>
              <button
                type="button"
                onClick={handleSaveOrderChanges}
                className="bg-primary text-surface-bright px-5 py-2 rounded text-xs font-label-lg uppercase tracking-wider cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
