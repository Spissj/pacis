import { Product, Order, SEED_PRODUCTS, SEED_ORDERS } from "./seed";
import { db } from "./firebase";
import { supabase } from "./supabase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";

// Read configuration from environment or default to localstorage
const getProvider = (): "localstorage" | "firebase" | "supabase" => {
  if (typeof window === "undefined") return "localstorage";
  const provider = process.env.NEXT_PUBLIC_DATABASE_PROVIDER?.replace(/['"]/g, "").trim();
  if (provider === "supabase" && supabase) {
    return "supabase";
  }
  if (provider === "firebase" && db) {
    return "firebase";
  }
  return "localstorage";
};

// --- DATABASE HELPER MAPPERS FOR SUPABASE ---
function mapOrderToDb(order: Order) {
  return {
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_email: order.customerEmail || null,
    event_date: order.eventDate,
    order_type: order.orderType,
    items: order.items || null,
    custom_details: order.customDetails || null,
    guest_count: order.guestCount || null,
    message: order.message || null,
    total_price: order.totalPrice,
    status: order.status,
    created_at: order.createdAt,
    internal_notes: order.internalNotes || null,
  };
}

function mapDbToOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    eventDate: row.event_date,
    orderType: row.order_type,
    items: row.items || undefined,
    customDetails: row.custom_details || undefined,
    guestCount: row.guest_count || undefined,
    message: row.message || undefined,
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
    internalNotes: row.internal_notes || undefined,
  };
}

// --- LOCAL STORAGE IMPLEMENTATION ---
const getLocalProducts = (): Product[] => {
  if (typeof window === "undefined") return SEED_PRODUCTS;
  const data = localStorage.getItem("pacis_products");
  if (!data) {
    localStorage.setItem("pacis_products", JSON.stringify(SEED_PRODUCTS));
    return SEED_PRODUCTS;
  }
  return JSON.parse(data);
};

const saveLocalProducts = (products: Product[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("pacis_products", JSON.stringify(products));
};

const getLocalOrders = (): Order[] => {
  if (typeof window === "undefined") return SEED_ORDERS;
  const data = localStorage.getItem("pacis_orders");
  if (!data) {
    localStorage.setItem("pacis_orders", JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  return JSON.parse(data);
};

const saveLocalOrders = (orders: Order[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("pacis_orders", JSON.stringify(orders));
};

// --- PUBLIC DATABASE API ---

export async function getProducts(): Promise<Product[]> {
  const provider = getProvider();
  
  if (provider === "supabase" && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
        
      if (error) throw error;
      
      const list = data as Product[];
      
      // If Supabase products table is empty, seed it
      if (list.length === 0) {
        const { error: seedError } = await supabase
          .from("products")
          .insert(SEED_PRODUCTS);
        if (seedError) throw seedError;
        return SEED_PRODUCTS;
      }
      return list;
    } catch (e) {
      console.error("Error fetching from Supabase, falling back to LocalStorage:", e);
    }
  }
  
  if (provider === "firebase" && db) {
    try {
      const q = query(collection(db, "products"), orderBy("name"));
      const snapshot = await getDocs(q);
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      // If Firebase collection is empty, seed it
      if (list.length === 0) {
        for (const p of SEED_PRODUCTS) {
          await setDoc(doc(db, "products", p.id), p);
          list.push(p);
        }
      }
      return list;
    } catch (e) {
      console.error("Error fetching from Firebase, falling back to LocalStorage:", e);
    }
  }

  return getLocalProducts();
}

export async function saveProduct(product: Product): Promise<void> {
  const provider = getProvider();

  if (provider === "supabase" && supabase) {
    try {
      const { error } = await supabase
        .from("products")
        .upsert(product);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Error saving to Supabase:", e);
    }
  }

  if (provider === "firebase" && db) {
    try {
      await setDoc(doc(db, "products", product.id), product);
      return;
    } catch (e) {
      console.error("Error saving to Firebase:", e);
    }
  }

  const products = getLocalProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  saveLocalProducts(products);
}

export async function deleteProduct(id: string): Promise<void> {
  const provider = getProvider();

  if (provider === "supabase" && supabase) {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return;
    } catch (e) {
      console.error("Error deleting from Supabase:", e);
    }
  }

  if (provider === "firebase" && db) {
    try {
      await deleteDoc(doc(db, "products", id));
      return;
    } catch (e) {
      console.error("Error deleting from Firebase:", e);
    }
  }

  const products = getLocalProducts();
  const updated = products.filter((p) => p.id !== id);
  saveLocalProducts(updated);
}

export async function getOrders(): Promise<Order[]> {
  const provider = getProvider();

  if (provider === "supabase" && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      const list = (data || []).map(mapDbToOrder);
      
      // If Supabase orders table is empty, seed it
      if (list.length === 0) {
        const dbOrders = SEED_ORDERS.map(mapOrderToDb);
        const { error: seedError } = await supabase
          .from("orders")
          .insert(dbOrders);
        if (seedError) throw seedError;
        return SEED_ORDERS.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      return list;
    } catch (e) {
      console.error("Error fetching orders from Supabase, falling back to LocalStorage:", e);
    }
  }

  if (provider === "firebase" && db) {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Order);
      });
      if (list.length === 0) {
        // Seed orders
        for (const o of SEED_ORDERS) {
          await setDoc(doc(db, "orders", o.id), o);
          list.push(o);
        }
      }
      return list;
    } catch (e) {
      console.error("Error fetching orders from Firebase, falling back to LocalStorage:", e);
    }
  }

  return getLocalOrders().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const provider = getProvider();

  if (provider === "supabase" && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .ilike("id", id)
        .maybeSingle();
        
      if (error) throw error;
      if (data) {
        return mapDbToOrder(data);
      }
      return null;
    } catch (e) {
      console.error("Error fetching order from Supabase:", e);
    }
  }

  if (provider === "firebase" && db) {
    try {
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      }
      return null;
    } catch (e) {
      console.error("Error fetching order from Firebase:", e);
    }
  }

  const orders = getLocalOrders();
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function createOrder(
  orderInput: Omit<Order, "id" | "createdAt" | "status">
): Promise<Order> {
  const provider = getProvider();
  
  // Generate a random 4-digit order ID
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `PC-${randomNum}`;
  
  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (provider === "supabase" && supabase) {
    try {
      const { error } = await supabase
        .from("orders")
        .insert(mapOrderToDb(newOrder));
      if (error) throw error;
      return newOrder;
    } catch (e) {
      console.error("Error creating order in Supabase, falling back to LocalStorage:", e);
    }
  }

  if (provider === "firebase" && db) {
    try {
      await setDoc(doc(db, "orders", orderId), newOrder);
      return newOrder;
    } catch (e) {
      console.error("Error creating order in Firebase, falling back to LocalStorage:", e);
    }
  }

  const orders = getLocalOrders();
  orders.push(newOrder);
  saveLocalOrders(orders);
  return newOrder;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  internalNotes?: string,
  totalPrice?: number
): Promise<Order | null> {
  const provider = getProvider();

  if (provider === "supabase" && supabase) {
    try {
      const updateData: any = { status };
      if (internalNotes !== undefined) updateData.internal_notes = internalNotes;
      if (totalPrice !== undefined) updateData.total_price = totalPrice;
      
      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .maybeSingle();
        
      if (error) throw error;
      if (data) {
        return mapDbToOrder(data);
      }
      return null;
    } catch (e) {
      console.error("Error updating order in Supabase:", e);
    }
  }

  if (provider === "firebase" && db) {
    try {
      const docRef = doc(db, "orders", id);
      const updateData: Partial<Order> = { status };
      if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
      if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
      
      await updateDoc(docRef, updateData);
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as Order;
    } catch (e) {
      console.error("Error updating order in Firebase:", e);
    }
  }

  const orders = getLocalOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index >= 0) {
    orders[index].status = status;
    if (internalNotes !== undefined) orders[index].internalNotes = internalNotes;
    if (totalPrice !== undefined) orders[index].totalPrice = totalPrice;
    saveLocalOrders(orders);
    return orders[index];
  }
  return null;
}
