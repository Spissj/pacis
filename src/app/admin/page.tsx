"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getOrders, getProducts, updateOrderStatus, saveProduct, deleteProduct } from "@/lib/db";
import { Order, Product } from "@/lib/seed";
import { supabase } from "@/lib/supabase";
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  ChefHat, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  Globe, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  Clock, 
  Check, 
  ChevronRight, 
  ClipboardList, 
  User, 
  Phone, 
  Mail, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

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

  // Fetch orders and products when logged in & subscribe to Supabase Realtime
  useEffect(() => {
    if (!isLoggedIn) return;

    loadData();

    // Only subscribe to realtime if database provider is supabase
    if (process.env.NEXT_PUBLIC_DATABASE_PROVIDER === "supabase") {
      const channel = supabase
        .channel("admin-orders-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          (payload) => {
            console.log("Realtime change received:", payload);
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
    <div className="min-h-screen bg-surface-bright pb-16 flex flex-col font-sans">
      {/* Top Admin Nav */}
      <nav className="bg-surface-container-low/95 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant/20 py-3.5 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" className="h-9 w-auto">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="38" fill="#3D1F0D" fontWeight="600" letterSpacing="-1">Paci's Cakes</text>
            <path d="M90 52 Q150 62 210 52" stroke="#E8B4B8" strokeWidth="2.5" fill="none" opacity="0.8"/>
          </svg>
          <span className="text-[10px] font-label-md uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Panel de Control
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider flex items-center gap-1.5 border border-outline-variant/40 hover:border-primary/30 px-3.5 py-1.5 rounded-lg bg-surface-bright"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Sitio Público</span>
            <span className="sm:hidden">Ver Sitio</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-error hover:text-white transition-all uppercase tracking-wider cursor-pointer border border-error/20 hover:border-error bg-error/5 hover:bg-error px-3.5 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* Main Admin Section */}
      <div className="max-w-container-max mx-auto px-gutter py-8 w-full flex-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/25 mb-8 gap-1.5 sm:gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-4 text-xs font-label-lg uppercase tracking-wider cursor-pointer relative flex items-center gap-2 px-1 whitespace-nowrap transition-all ${
              activeTab === "stats" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
            {activeTab === "stats" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t" />}
          </button>
          
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-xs font-label-lg uppercase tracking-wider cursor-pointer relative flex items-center gap-2 px-1 whitespace-nowrap transition-all ${
              activeTab === "orders" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos</span>
            <span className="bg-primary-container/20 text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-container/20">
              {orders.length}
            </span>
            {activeTab === "orders" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t" />}
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`pb-4 text-xs font-label-lg uppercase tracking-wider cursor-pointer relative flex items-center gap-2 px-1 whitespace-nowrap transition-all ${
              activeTab === "menu" ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Administrar Menú</span>
            {activeTab === "menu" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t" />}
          </button>
        </div>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-xs text-on-surface-variant font-medium">Actualizando información...</p>
          </div>
        )}

        {/* TAB content */}
        {!isLoading && (
          <>
            {/* TAB 1: DASHBOARD STATS */}
            {activeTab === "stats" && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue Card */}
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm hover:shadow transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                          Ventas Totales
                        </span>
                        <div className="font-serif text-2xl sm:text-3xl font-bold text-dark-chocolate">
                          {formatPrice(statsRevenue)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-600/80 font-medium mt-3 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Excluye cancelados
                    </span>
                  </div>

                  {/* Pending Card */}
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm hover:shadow transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                          Pendientes
                        </span>
                        <div className="font-serif text-2xl sm:text-3xl font-bold text-dark-chocolate">
                          {statsPending}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-600/80 font-medium mt-3 block">Requieren aprobación</span>
                  </div>

                  {/* In Production Card */}
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm hover:shadow transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                          En Cocina
                        </span>
                        <div className="font-serif text-2xl sm:text-3xl font-bold text-dark-chocolate">
                          {statsProduction}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                        <ChefHat className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-600/80 font-medium mt-3 block">En elaboración activa</span>
                  </div>

                  {/* Ready Card */}
                  <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-xl shadow-sm hover:shadow transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80 block mb-1">
                          Listos para Entrega
                        </span>
                        <div className="font-serif text-2xl sm:text-3xl font-bold text-dark-chocolate">
                          {statsReady}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-[10px] text-teal-600/80 font-medium mt-3 block">Esperando entrega/retiro</span>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-5 border-b border-outline-variant/10 pb-4">
                    <h3 className="font-headline-sm text-xl text-dark-chocolate flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Pedidos Recientes
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Ver todos los pedidos
                    </button>
                  </div>
                  
                  {orders.length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-8 text-center font-medium">No hay pedidos registrados en la base de datos.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.slice(0, 6).map((o) => (
                        <div
                          key={o.id}
                          onClick={() => openOrderModal(o)}
                          className="flex justify-between items-center p-4 border border-outline-variant/10 rounded-xl hover:border-primary/45 cursor-pointer bg-surface-bright hover:shadow-sm transition-all duration-300 group"
                        >
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md inline-block">{o.id}</span>
                            <span className="font-semibold text-sm text-dark-chocolate block group-hover:text-primary transition-colors">{o.customerName}</span>
                            <span className="text-xs text-on-surface-variant/80 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-on-surface-variant/60" /> {o.eventDate}
                            </span>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-1.5">
                            <span className="font-serif text-sm font-bold text-dark-chocolate">{formatPrice(o.totalPrice)}</span>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                              o.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200/50" :
                              o.status === "approved" ? "bg-sky-50 text-sky-700 border-sky-200/50" :
                              o.status === "production" ? "bg-purple-50 text-purple-700 border-purple-200/50" :
                              o.status === "ready" ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" :
                              o.status === "delivered" ? "bg-zinc-50 text-zinc-600 border-zinc-200/50" :
                              "bg-rose-50 text-rose-700 border-rose-200/50"
                            }`}>
                              {o.status === "pending" ? "Pendiente" :
                               o.status === "approved" ? "Aprobado" :
                               o.status === "production" ? "En Cocina" :
                               o.status === "ready" ? "Listo" :
                               o.status === "delivered" ? "Entregado" :
                               "Cancelado"}
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
                      <tr className="bg-surface-container text-dark-chocolate font-label-lg text-xs uppercase tracking-wider border-b border-outline-variant/25">
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
                        <tr key={o.id} className="hover:bg-surface-bright/50 transition-colors group">
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md inline-block">{o.id}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-dark-chocolate group-hover:text-primary transition-colors">{o.customerName}</div>
                            <div className="text-xs text-on-surface-variant/75 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-on-surface-variant/50" /> {o.customerPhone}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-on-surface-variant font-medium">{o.eventDate}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              o.orderType === "custom" ? "bg-tertiary-container/10 text-tertiary border-tertiary-container/30" : "bg-primary-container/10 text-on-primary-container border-primary-container/30"
                            }`}>
                              {o.orderType === "custom" ? "Personalizada" : "Catálogo"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-serif font-bold text-dark-chocolate">
                            {formatPrice(o.totalPrice)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border inline-block ${
                              o.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200/50" :
                              o.status === "approved" ? "bg-sky-50 text-sky-700 border-sky-200/50" :
                              o.status === "production" ? "bg-purple-50 text-purple-700 border-purple-200/50" :
                              o.status === "ready" ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" :
                              o.status === "delivered" ? "bg-zinc-50 text-zinc-600 border-zinc-200/50" :
                              "bg-rose-50 text-rose-700 border-rose-200/50"
                            }`}>
                              {o.status === "pending" ? "Pendiente" :
                               o.status === "approved" ? "Aprobado" :
                               o.status === "production" ? "En Cocina" :
                               o.status === "ready" ? "Listo" :
                               o.status === "delivered" ? "Entregado" :
                               "Cancelado"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => openOrderModal(o)}
                              className="text-xs bg-surface-bright hover:bg-primary hover:text-white border border-outline-variant/60 hover:border-primary transition-all px-3.5 py-1.5 rounded-lg cursor-pointer font-bold inline-flex items-center gap-1.5"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Administrar</span>
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
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                  <div>
                    <h3 className="font-headline-sm text-xl text-dark-chocolate">Gestión de Catálogo</h3>
                    <p className="text-xs text-on-surface-variant">Agrega, edita o elimina los productos de la tienda.</p>
                  </div>
                  {!isAddingProduct && (
                    <button
                      onClick={() => {
                        resetProductForm();
                        setIsAddingProduct(true);
                      }}
                      className="bg-primary text-surface-bright px-4 py-2.5 rounded-lg hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir Producto</span>
                    </button>
                  )}
                </div>

                {isAddingProduct ? (
                  /* Add/Edit Form */
                  <form onSubmit={handleSaveProduct} className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-xl shadow-sm space-y-6 max-w-2xl mx-auto animate-scale-up">
                    <h4 className="font-headline-sm text-lg text-dark-chocolate border-b border-outline-variant/10 pb-3 flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-primary" />
                      {editingProduct ? "Editar Producto del Menú" : "Añadir Nuevo Producto al Menú"}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5 font-bold" htmlFor="prod-name">
                          Nombre del Producto *
                        </label>
                        <input
                          type="text"
                          id="prod-name"
                          required
                          placeholder="Ej. Torta Tentación de Caramelo"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5 font-bold" htmlFor="prod-price">
                          Precio de Base ($ COP) *
                        </label>
                        <input
                          type="number"
                          id="prod-price"
                          required
                          placeholder="Ej. 120000"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5 font-bold" htmlFor="prod-cat">
                          Categoría *
                        </label>
                        <select
                          id="prod-cat"
                          value={prodCat}
                          onChange={(e) => setProdCat(e.target.value as any)}
                          className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                        >
                          <option value="tortas">Tortas</option>
                          <option value="cupcakes">Cupcakes</option>
                          <option value="galletas">Galletas</option>
                          <option value="especiales">Especiales</option>
                          <option value="creaciones">Creaciones</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5 font-bold" htmlFor="prod-img">
                          URL de Imagen (Supabase Bucket o pública) *
                        </label>
                        <input
                          type="text"
                          id="prod-img"
                          required
                          placeholder="https://..."
                          value={prodImg}
                          onChange={(e) => setProdImg(e.target.value)}
                          className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-label-md uppercase tracking-wider text-dark-chocolate mb-1.5 font-bold" htmlFor="prod-desc">
                        Descripción Corta
                      </label>
                      <textarea
                        id="prod-desc"
                        rows={3}
                        placeholder="Describe los ingredientes, decoraciones o detalles de empaque..."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none transition-colors"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 bg-surface-bright p-4 rounded-lg border border-outline-variant/20">
                      <input
                        type="checkbox"
                        id="prod-active"
                        checked={prodActive}
                        onChange={(e) => setProdActive(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                      />
                      <label htmlFor="prod-active" className="text-xs text-dark-chocolate font-bold cursor-pointer select-none">
                        Producto Activo (Visible en el catálogo del sitio)
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-5 border-t border-outline-variant/15">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                          resetProductForm();
                        }}
                        className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-label-lg uppercase tracking-wider cursor-pointer font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-surface-bright px-5 py-2.5 rounded-lg hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer font-bold"
                      >
                        Guardar Producto
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Products Card Grid Redesign */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p) => (
                      <div key={p.id} className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                        {/* Image Container */}
                        <div className="h-48 relative bg-surface-container-high overflow-hidden border-b border-outline-variant/10">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <span className="absolute top-3 right-3 bg-surface-bright/90 backdrop-blur-md text-dark-chocolate text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-outline-variant/10 uppercase">
                            {p.category}
                          </span>
                          {!p.active && (
                            <div className="absolute inset-0 bg-dark-chocolate/50 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow">
                                Inactivo
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h4 className="font-headline-sm text-lg text-dark-chocolate font-bold leading-tight group-hover:text-primary transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-xs text-on-surface-variant/85 leading-relaxed line-clamp-3">
                              {p.description}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-outline-variant/10 flex justify-between items-center">
                            <span className="font-serif text-base font-bold text-primary">
                              {formatPrice(p.price)}
                            </span>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="text-[11px] bg-surface-bright border border-outline-variant/50 hover:border-primary hover:text-primary px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold flex items-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProductClick(p.id)}
                                className="text-[11px] border border-error/20 bg-error/5 hover:bg-error hover:text-white text-error px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-bold flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Borrar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* DETAIL AND EDIT STATUS MODAL FOR ORDERS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-chocolate/50 backdrop-blur-md animate-fade-in">
          <div className="bg-surface-bright rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-outline-variant/20 relative animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/40">
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md inline-block">{selectedOrder.id}</span>
                <h3 className="font-display-lg text-2xl text-dark-chocolate font-bold">Resumen de Comanda</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-on-surface-variant hover:text-primary transition-all cursor-pointer p-1.5 rounded-full hover:bg-surface-container-low"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h4 className="font-label-lg text-[10px] uppercase tracking-widest text-on-surface-variant/80 font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Información del Cliente
                </h4>
                <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/15 text-sm space-y-2.5 text-on-surface-variant">
                  <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Nombre:</strong> {selectedOrder.customerName}</div>
                  <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Teléfono:</strong> {selectedOrder.customerPhone}</div>
                  {selectedOrder.customerEmail && <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Email:</strong> {selectedOrder.customerEmail}</div>}
                  <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Entrega:</strong> {selectedOrder.eventDate}</div>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="space-y-2">
                <h4 className="font-label-lg text-[10px] uppercase tracking-widest text-on-surface-variant/80 font-bold flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                  Artículos del Pedido
                </h4>
                {selectedOrder.orderType === "catalog" ? (
                  /* Catalog items */
                  <div className="space-y-2 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/15">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span>{item.name} <span className="text-xs text-primary font-bold">(x{item.quantity})</span></span>
                        <span className="font-serif font-bold text-dark-chocolate">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Custom cake details */
                  <div className="bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/15 text-sm space-y-2.5 text-on-surface-variant">
                    <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Tipo:</strong> Torta Personalizada</div>
                    <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Porciones:</strong> {selectedOrder.customDetails?.portions} porciones</div>
                    <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Bizcocho:</strong> {selectedOrder.customDetails?.spongeFlavor}</div>
                    <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Relleno:</strong> {selectedOrder.customDetails?.fillingFlavor}</div>
                    <div className="flex items-center gap-2"><strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider">Colores:</strong> {selectedOrder.customDetails?.colors.join(", ")}</div>
                    {selectedOrder.customDetails?.cakeText && (
                      <div className="flex items-start gap-2">
                        <strong className="w-24 text-dark-chocolate text-xs uppercase tracking-wider mt-0.5">Mensaje:</strong> 
                        <span className="italic text-primary font-bold">"{selectedOrder.customDetails?.cakeText}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message from client */}
              {selectedOrder.message && (
                <div className="space-y-1.5">
                  <h4 className="font-label-lg text-[10px] uppercase tracking-widest text-on-surface-variant/80 font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Instrucciones Especiales
                  </h4>
                  <p className="text-xs bg-surface-container-low/50 p-3.5 rounded-xl border border-outline-variant/15 text-on-surface-variant italic leading-relaxed">
                    "{selectedOrder.message}"
                  </p>
                </div>
              )}

              {/* Admin modifications (Price & Notes) */}
              <div className="border-t border-outline-variant/20 pt-5 space-y-4">
                <h4 className="font-label-lg text-[10px] uppercase tracking-widest text-dark-chocolate font-bold">Edición y Estado</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Precio de Venta ($ COP)
                    </label>
                    <input
                      type="number"
                      value={editingOrderPrice}
                      onChange={(e) => setEditingOrderPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Estado del Pedido
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                      className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                    >
                      <option value="pending">⏳ Pendiente</option>
                      <option value="approved">✔️ Aprobado</option>
                      <option value="production">👩‍🍳 En Cocina</option>
                      <option value="ready">📦 Listo para Entrega</option>
                      <option value="delivered">💖 Entregado</option>
                      <option value="cancelled">❌ Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Notas Internas (Bitácora de producción)
                  </label>
                  <textarea
                    rows={2}
                    value={editingOrderNotes}
                    onChange={(e) => setEditingOrderNotes(e.target.value)}
                    className="w-full bg-surface-bright border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm outline-none resize-none transition-colors"
                    placeholder="Escribe detalles internos (ej. colores finales, insumos listos, etc.)"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons for Order Modal */}
            <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container-low/40">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-label-lg uppercase tracking-wider cursor-pointer font-bold transition-colors hover:bg-surface-container-low"
              >
                Cerrar sin guardar
              </button>
              <button
                type="button"
                onClick={handleSaveOrderChanges}
                className="bg-primary text-surface-bright px-5 py-2.5 rounded-lg hover:bg-on-primary-container transition-colors text-xs font-label-lg uppercase tracking-wider cursor-pointer font-bold"
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
