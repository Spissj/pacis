export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "tortas" | "cupcakes" | "galletas" | "especiales" | "creaciones";
  image: string;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomCakeDetails {
  portions: number;
  spongeFlavor: string;
  fillingFlavor: string;
  cakeText: string;
  colors: string[];
  referenceImage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventDate: string;
  orderType: "catalog" | "custom";
  items?: OrderItem[];
  customDetails?: CustomCakeDetails;
  guestCount?: number;
  message?: string;
  totalPrice: number;
  status: "pending" | "approved" | "production" | "ready" | "delivered" | "cancelled";
  createdAt: string;
  internalNotes?: string;
}

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-9",
    name: "Torta Elegancia en Rosa",
    description: "Una obra maestra de repostería con base de bizcocho húmedo, cubierta con rosas de azúcar modeladas a mano pétalo por pétalo. Ideal para celebraciones memorables.",
    price: 55000,
    category: "creaciones",
    image: "https://xbddtwvpyuyykofiezlu.supabase.co/storage/v1/object/public/Multimedia/Imagenes/SaveClip.App_616012201_18036692648739051_1837799206288498423_n.jpg",
    active: true,
  },
  {
    id: "prod-10",
    name: "Torta Romance de Frutos Rojos",
    description: "La fusión perfecta de texturas y sabor. Delicado bizcocho húmedo de frutos rojos frescos cubierto con un liso buttercream suizo y detalles románticos.",
    price: 52000,
    category: "creaciones",
    image: "https://xbddtwvpyuyykofiezlu.supabase.co/storage/v1/object/public/Multimedia/Imagenes/SaveClip.App_566760215_18027699599739051_4521962357029755657_n.jpg",
    active: true,
  },
  {
    id: "prod-11",
    name: "Torta Escultural de Fondant",
    description: "Diseño minimalista tridimensional esculpido con fondant satinado. Acabados impecables tipo editorial para los amantes del arte moderno.",
    price: 78000,
    category: "creaciones",
    image: "https://xbddtwvpyuyykofiezlu.supabase.co/storage/v1/object/public/Multimedia/Imagenes/SaveClip.App_542764527_18022298249739051_2057483704491238136_n.jpg",
    active: true,
  },
  {
    id: "prod-12",
    name: "Torta Imperial Hilos de Oro",
    description: "Nuestra creación de lujo definitivo. Torta decorada con hilos de oro comestible de 24 quilates y pinceladas metalizadas de la más alta repostería.",
    price: 85000,
    category: "creaciones",
    image: "https://xbddtwvpyuyykofiezlu.supabase.co/storage/v1/object/public/Multimedia/Imagenes/SaveClip.App_641766096_18041451164739051_4215571093809624552_n.jpg",
    active: true,
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: "PC-9531",
    customerName: "Andrés Figueroa",
    customerPhone: "+57 312 456 7890",
    customerEmail: "andres@correo.com",
    eventDate: "2026-06-15",
    orderType: "catalog",
    items: [
      { productId: "prod-1", name: "Torta Floral Elegance", price: 45000, quantity: 1 },
      { productId: "prod-3", name: "Cupcakes Premium", price: 15000, quantity: 1 }
    ],
    totalPrice: 60000,
    status: "approved",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    message: "Entregar en la tarde por favor. Es un regalo sorpresa de cumpleaños.",
    internalNotes: "Confirmado el envío a las 3 PM. Cliente solicitó una vela dorada."
  },
  {
    id: "PC-9824",
    customerName: "Valentina Restrepo",
    customerPhone: "+57 320 987 6543",
    customerEmail: "valentina@correo.com",
    eventDate: "2026-06-25",
    orderType: "custom",
    customDetails: {
      portions: 30,
      spongeFlavor: "Red Velvet",
      fillingFlavor: "Crema Suiza de Queso",
      cakeText: "Mis Dulces 30",
      colors: ["Rosa Viejo", "Dorado"],
      referenceImage: "Torta de Flores en Acuarela"
    },
    guestCount: 30,
    message: "Deseo un diseño muy elegante con flores naturales, detalles en hojilla de oro y letras cursivas en dorado.",
    totalPrice: 85000,
    status: "pending",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    internalNotes: "Revisar stock de hojillas de oro para esta fecha."
  }
];
