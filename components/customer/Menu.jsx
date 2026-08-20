"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
// --- SVG ICON COMPONENTS FOR PREMIUM LOOK ---
const SearchIcon = () => (
  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StaffIcon = () => (
  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="7" r="3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 13.5l4 2m-4 0l4-2" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const BellIcon = StaffIcon;

const StarIcon = () => (
  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-amber-300" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const FlameIcon = () => (
  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const SkullIcon = () => (
  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2A9 9 0 003 11c0 3.25 1.72 6.09 4.3 7.62V20a1 1 0 001 1h1a1 1 0 001-1v-1h4v1a1 1 0 001 1h1a1 1 0 001-1v-1.38C19.28 17.09 21 14.25 21 11A9 9 0 0012 2zm-3.5 8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM9.5 16a.5.5 0 010-1h5a.5.5 0 010 1h-5z" />
  </svg>
);

// --- DIETARY BADGES ---
const VegBadge = () => (
  <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded border border-emerald-400 bg-emerald-950/90 p-0.5 shadow" title="Vegetarian">
    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400" />
  </div>
);

const NonVegBadge = () => (
  <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded border border-rose-400 bg-rose-950/90 p-0.5 shadow" title="Non-Vegetarian">
    <div className="h-0 w-0 border-x-[3.5px] sm:border-x-4 border-x-transparent border-b-[6px] sm:border-b-[7px] border-b-rose-500" />
  </div>
);

const VeganBadge = () => (
  <div className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded border border-emerald-400 bg-emerald-950/90 p-[1px] shadow" title="Vegan">
    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 59 16.17 3.82 21.34L2.41 19.93C6.31 16.03 10.63 11.5 17 8M17 8C17 14 13.5 19 8.5 21" />
    </svg>
  </div>
);

export default function Menu({ tableToken = "demo-token", tablenumber = 1 }) {
  // State management
  const [selectedCategory, setSelectedCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState("all");
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [kitchenNotes, setKitchenNotes] = useState("");
  const [tipPercentage, setTipPercentage] = useState(0);

  // Modals state
  const [customizingDish, setCustomizingDish] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceNotice, setServiceNotice] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // --- SESSION / REGISTRATION STATE ---
  const [isRegistered, setIsRegistered] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [regError, setRegError] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [sessionCheckDone, setSessionCheckDone] = useState(false);

  // --- CURRENT SESSION ORDERS STATE ---
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [tick, setTick] = useState(0);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Trigger rerender every second to update countdowns when orders modal is open
  useEffect(() => {
    if (!isOrdersModalOpen && !activeOrder) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOrdersModalOpen, activeOrder]);

  // Fetch all orders for current session callback
  const fetchSessionOrders = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch session orders:", err);
    }
  }, [sessionId]);

  // Cancel order callback (triggers custom modal)
  const handleCancelOrder = useCallback((orderId) => {
    setOrderToCancel(orderId);
  }, []);

  // Execute cancellation after confirmation
  const executeCancelOrder = useCallback(async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        // Refresh orders list
        await fetchSessionOrders();
        // Clear activeOrder state if matches
        setActiveOrder((prev) => (prev && prev.id === orderId ? null : prev));
      } else {
        alert("Failed to cancel order.");
      }
    } catch (err) {
      console.error("Cancel order error:", err);
      alert("Error cancelling order.");
    }
  }, [fetchSessionOrders]);

  // --- SESSION PERSISTENCE: check sessionStorage on mount ---
  useEffect(() => {
    const stored = sessionStorage.getItem(`rip-session-table-${tablenumber}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify the session is still active on the backend
        fetch(`/api/sessions/${parsed.sessionId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Session not found");
            return res.json();
          })
          .then((data) => {
            if (data.status === "ACTIVE") {
              setSessionId(parsed.sessionId);
              setCustomerName(parsed.customerName);
              setCustomerPhone(parsed.customerPhone);
              setIsRegistered(true);
              // Store initial orders
              if (data.orders) {
                setSessionOrders(data.orders);
              }
            } else {
              // Session ended, clear storage
              sessionStorage.removeItem(`rip-session-table-${tablenumber}`);
            }
          })
          .catch(() => {
            sessionStorage.removeItem(`rip-session-table-${tablenumber}`);
          })
          .finally(() => setSessionCheckDone(true));
      } catch {
        sessionStorage.removeItem(`rip-session-table-${tablenumber}`);
        setSessionCheckDone(true);
      }
    } else {
      setSessionCheckDone(true);
    }
  }, [tablenumber]);

  // --- POLL SESSION STATUS (to detect when session ends, every 30s) ---
  useEffect(() => {
    if (!sessionId || !isRegistered) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== "ACTIVE") {
            // Session has ended — clear everything
            setIsRegistered(false);
            setSessionId(null);
            setCustomerName("");
            setCustomerPhone("");
            setCart([]);
            setActiveOrder(null);
            setSessionOrders([]);
            sessionStorage.removeItem(`rip-session-table-${tablenumber}`);
          } else {
            // Update orders history listing
            if (data.orders) {
              setSessionOrders(data.orders);
            }
          }
        }
      } catch (err) {
        console.error("Failed to poll session:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId, isRegistered, tablenumber]);



  // --- FILTER LOGIC ---
  // FIX: added `dishes` to the dependency array. Without it, this memo was
  // computed once on the initial render (when `dishes` was still an empty
  // array from useState([])) and never recalculated after fetchDishes()
  // populated it, so the menu always rendered as empty.
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (selectedCategory === "Bestsellers" && !dish.isBestseller) return false;
      if (
        selectedCategory !== "All Items" &&
        selectedCategory !== "Bestsellers" &&
        dish.category !== selectedCategory
      ) {
        return false;
      }

      if (dietaryFilter === "veg" && dish.dietary !== "veg" && dish.dietary !== "vegan") return false;
      if (dietaryFilter === "non-veg" && dish.dietary !== "non-veg") return false;
      if (dietaryFilter === "vegan" && dish.dietary !== "vegan") return false;
      if (dietaryFilter === "bestsellers" && !dish.isBestseller) return false;

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = (dish.description || "").toLowerCase().includes(query);
        const matchesCategory = dish.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    });
  }, [dishes, selectedCategory, dietaryFilter, searchQuery]);

  // --- CUSTOMIZATION MODAL OPEN ---
  const handleOpenCustomization = (dish) => {
    if (dish.hasCustomization && dish.options) {
      setSelectedOptions({});
      setCustomizingDish(dish);
    } else {
      addToCartDirectly(dish);
    }
  };

  // --- CALCULATE CUSTOM DISH PRICE ---
  const calculateCustomPrice = (dish, opts) => {
    let extra = 0;
    if (dish.options?.milk) {
      const selectedMilkObj = dish.options.milk.find((m) => m.name === opts.milk);
      if (selectedMilkObj) extra += selectedMilkObj.price;
    }
    if (opts.addOns && opts.addOns.length > 0) {
      opts.addOns.forEach((addOnName) => {
        const addOnObj = dish.options?.addOns?.find((a) => a.name === addOnName);
        if (addOnObj) extra += addOnObj.price;
      });
    }
    return dish.price + extra;
  };

  // --- ADD TO CART DIRECTLY ---
  const addToCartDirectly = (dish) => {
    const cartItemId = `dish-${dish.id}-std`;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: dish.id,
          name: dish.name,
          basePrice: dish.price,
          unitPrice: dish.price,
          quantity: 1,
          customizations: null,
          image: dish.image,
          dietary: dish.dietary,
        },
      ];
    });
  };

  // --- ADD CUSTOMIZED ITEM TO CART ---
  const handleConfirmCustomization = () => {
    if (!customizingDish) return;
    const finalUnitPrice = calculateCustomPrice(customizingDish, selectedOptions);

    const optSummaryParts = [];
    if (selectedOptions.temperature) optSummaryParts.push(selectedOptions.temperature);
    if (selectedOptions.milk) optSummaryParts.push(selectedOptions.milk);
    if (selectedOptions.sweetness) optSummaryParts.push(selectedOptions.sweetness);
    if (selectedOptions.bread) optSummaryParts.push(selectedOptions.bread);
    if (selectedOptions.addOns && selectedOptions.addOns.length > 0) {
      optSummaryParts.push(`Add-ons: ${selectedOptions.addOns.join(", ")}`);
    }
    const custSummary = optSummaryParts.join(" • ");
    const cartItemId = `dish-${customizingDish.id}-${JSON.stringify(selectedOptions)}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          id: customizingDish.id,
          name: customizingDish.name,
          basePrice: customizingDish.price,
          unitPrice: finalUnitPrice,
          quantity: 1,
          customizations: custSummary,
          image: customizingDish.image,
          dietary: customizingDish.dietary,
        },
      ];
    });

    setCustomizingDish(null);
  };

  // --- CART QUANTITY MODIFIERS ---
  const updateCartQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // --- CALCULATIONS ---
  const totalCartItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const taxAmount = Math.round(subtotal * 0.05);
  const tipAmount = Math.round((subtotal * tipPercentage) / 100);
  const grandTotal = subtotal + taxAmount + tipAmount;

  // --- SERVICE REQUEST (WAITER CALL) ---
  const triggerServiceRequest = async (requestType) => {
    setIsServiceModalOpen(false);
    setServiceNotice(`Requested: "${requestType}" for Table ${tablenumber}. Server notified! 🛎️`);
    setTimeout(() => {
      setServiceNotice(null);
    }, 4500);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tablenumber,
          message: requestType,
        }),
      });
    } catch (err) {
      console.error("Failed to send waiter request:", err);
    }
  };

  // --- EXECUTE PLACE ORDER ---
  const executePlaceOrder = async (currentSessionId, currName, currPhone, customNotes) => {
    setOrderSubmitting(true);
    try {
      const targetSessionId = currentSessionId || sessionId;
      const targetName = currName || customerName || "Guest Customer";
      const targetPhone = currPhone || customerPhone || "0000000000";
      const targetNotes = customNotes !== undefined ? customNotes : kitchenNotes;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: tablenumber,
          items: cart,
          totalAmount: grandTotal,
          customerName: targetName,
          customerPhone: targetPhone,
          sessionId: targetSessionId,
          notes: targetNotes,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to place order");
      }

      const createdOrder = await response.json();
      const actualSessionId = createdOrder.sessionId || createdOrder.session?.id || targetSessionId;

      if (actualSessionId) {
        setSessionId(actualSessionId);
        setIsRegistered(true);
        setCustomerName(targetName);
        setCustomerPhone(targetPhone);
        sessionStorage.setItem(
          `rip-session-table-${tablenumber}`,
          JSON.stringify({
            sessionId: actualSessionId,
            customerName: targetName,
            customerPhone: targetPhone,
          })
        );
      }

      const newOrder = {
        id: createdOrder.id,
        orderId: `RIP-${createdOrder.id}`,
        table: tablenumber,
        items: [...cart],
        total: grandTotal,
        notes: targetNotes || createdOrder.notes || "",
        status: createdOrder.status.toLowerCase(),
        placedAt: new Date(createdOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        createdAt: createdOrder.createdAt,
        placedTimeClientMs: Date.now(),
      };

      setActiveOrder(newOrder);
      setCart([]);
      setIsCartOpen(false);
      setIsCustomerModalOpen(false);
      setKitchenNotes("");

      // Refresh current session orders immediately
      if (actualSessionId) {
        try {
          const res = await fetch(`/api/sessions/${actualSessionId}`);
          if (res.ok) {
            const data = await res.json();
            setSessionOrders(data.orders || []);
          }
        } catch (err) {
          console.error("Failed to fetch session orders on place:", err);
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "Failed to place order. Please try again.");
    } finally {
      setOrderSubmitting(false);
    }
  };

  // --- SUBMIT CUSTOMER DETAILS AT ORDER TIME ---
  const handleCustomerFormSubmit = async (e) => {
    e.preventDefault();
    setRegError("");

    const trimmedName = regName.trim();
    const trimmedPhone = regPhone.trim();

    if (!trimmedName) {
      setRegError("Please enter your name.");
      return;
    }
    if (!trimmedPhone || !/^[0-9]{10}$/.test(trimmedPhone)) {
      setRegError("Please enter a valid 10-digit phone number.");
      return;
    }

    setRegSubmitting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          tableNumber: tablenumber,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create session");
      }

      const data = await res.json();

      setSessionId(data.sessionId);
      setCustomerName(data.customerName);
      setCustomerPhone(data.customerPhone);
      setIsRegistered(true);

      // Persist to sessionStorage
      sessionStorage.setItem(
        `rip-session-table-${tablenumber}`,
        JSON.stringify({
          sessionId: data.sessionId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
        })
      );

      // Directly proceed to place order with kitchen notes
      await executePlaceOrder(data.sessionId, data.customerName, data.customerPhone, kitchenNotes);
    } catch (err) {
      console.error("Registration error:", err);
      setRegError("Something went wrong. Please try again.");
    } finally {
      setRegSubmitting(false);
    }
  };

  // --- INITIATE ORDER (Check customer registration first) ---
  const handleInitiateOrder = () => {
    if (cart.length === 0) return;

    // If customer details / session not established yet, prompt for details
    if (!isRegistered || !sessionId || !customerName || !customerPhone) {
      setRegError("");
      if (customerName) setRegName(customerName);
      if (customerPhone) setRegPhone(customerPhone);
      setIsCustomerModalOpen(true);
      return;
    }

    // Already registered, place order directly
    executePlaceOrder(sessionId, customerName, customerPhone, kitchenNotes);
  };

  // Poll active order status from backend (every 10s — frequent enough to feel live)
  useEffect(() => {
    if (!activeOrder?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${activeOrder.id}`);
        if (res.ok) {
          const data = await res.json();
          setActiveOrder((prev) => (prev ? { ...prev, status: data.status.toLowerCase() } : null));
        }
      } catch (err) {
        console.error("Failed to poll order status:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeOrder?.id]);

  useEffect(() => {
    async function fetchDishes() {
      try {
        const response = await fetch("/api/dishes");

        if (!response.ok) {
          throw new Error("Failed to fetch dishes");
        }

        const data = await response.json();

        const formattedDishes = data.map((dish) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description || "",
          price: Number(dish.price),
          category: dish.category?.name || dish.category || "All",
          dietary: dish.dietary,
          isBestseller: dish.isBestseller,
          isSpooky: dish.isSpooky,
          prepTime: dish.prepTime,
          calories: dish.calories,
          image: dish.imageUrl,
          available: dish.available,
          hasCustomization: dish.hasCustomization,
          options: dish.options,
        }));

        setDishes(formattedDishes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    // Fetch once on mount — dishes rarely change mid-session.
    // Admin changes will be visible on the next page visit / manual refresh.
    fetchDishes();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        setCategories(data);
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    }

    fetchCategories();
  }, []);

  // --- Don't render anything until session check is done ---
  if (!sessionCheckDone) {
    return (
      <div className="relative min-h-screen w-full bg-gradient-to-b from-[#030304] via-[#0A090E] to-[#040406] font-sans text-slate-100 antialiased flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
          <p className="mt-3 text-xs text-slate-500">Loading session…</p>
        </div>
      </div>
    );
  }



  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#030304] via-[#0A090E] to-[#040406] font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-black">

      {/* Toast Notice Banner for Customer Table Service */}
      {serviceNotice && (
        <div className="fixed top-4 left-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl border border-amber-400/60 bg-[#16131D]/95 px-4 py-3.5 text-center text-xs font-semibold text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.35)] backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-400 text-sm">🛎️</span>
            <span>{serviceNotice}</span>
          </div>
        </div>
      )}

      {/* --- RESPONSIVE WRAPPER CONTAINER (FLUID MAX-W-7XL) --- */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">

        {/* --- HERO BRAND HEADER --- */}
        <header className="relative overflow-hidden mt-4 sm:mt-5 mb-2 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#16131F] via-[#0E0C15] to-[#050508] px-4 sm:px-6 pt-4 pb-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          {/* Ambient Golden Glow Effects */}
          <div className="pointer-events-none absolute -top-10 -left-10 h-52 w-52 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="pointer-events-none absolute top-2 -right-10 h-48 w-48 rounded-full bg-amber-600/10 blur-3xl" />

          {/* Main Context Wrapper */}
          <div className="relative z-10 flex flex-col gap-3 w-full">

            {/* --- TOP SECTION: LOGO & BRAND NAME --- */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 w-full">

              {/* Logo */}
              <div className="shrink-0">
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28">
                  <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-md pointer-events-none" />
                  <img
                    src="/logo.png"
                    alt="Rest In Peace Cafe Logo"
                    className="w-full h-full object-contain drop-shadow-md"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </div>
              </div>

              {/* Brand name, Address & Social */}
              <div className="flex flex-col items-center sm:items-start justify-center gap-1 min-w-0 w-full sm:w-auto">
                <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-widest uppercase font-serif gold-gradient-text drop-shadow-lg leading-none text-center sm:text-left">
                  Rest In Peace CAFE
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400">Sitra, Coimbatore</span>
                </div>

                {/* Instagram & Contact Row */}
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-1 w-full">
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/rest_in_peace_cafe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-pink-400 hover:text-pink-300 transition"
                  >
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    <span>rest_in_peace_cafe</span>
                  </a>

                  {/* Divider dot */}
                  <span className="h-1 w-1 rounded-full bg-slate-600" />

                  {/* Contact */}
                  <a
                    href="tel:7708502276"
                    className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>7708502276</span>
                  </a>
                </div>
              </div>

            </div>

            {/* --- BOTTOM SECTION: TABLE NO, CUSTOMER & WAITER ALERTS --- */}
            <div className="flex flex-row items-center justify-between border-t border-amber-500/20 pt-3 w-full gap-2">

              {/* Table Number + Customer Name */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] sm:text-xs font-extrabold text-amber-400 tracking-wider border border-amber-500/40 rounded-xl px-3 py-1.5 bg-amber-950/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] whitespace-nowrap">
                  Table {tablenumber}
                </span>
                {customerName && (
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-400 tracking-wide border border-emerald-500/30 rounded-xl px-2.5 py-1.5 bg-emerald-950/30 truncate max-w-[150px]" title={customerName}>
                    👤 {customerName}
                  </span>
                )}
              </div>
            </div>

          </div>

        </header>

        {/* --- FLOATING ROUND CALL STAFF / WAITER BUTTON (OUTSIDE BANNER) --- */}
        <button
          onClick={() => setIsServiceModalOpen(true)}
          title="Call Staff / Table Assistance"
          aria-label="Call Staff"
          className="fixed bottom-24 right-4 sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-700 border-2 border-amber-300/90 text-black shadow-[0_0_25px_rgba(245,158,11,0.55)] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            {/* Staff / Waiter Icon */}
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="7" r="3.5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 20.5v-2a4.5 4.5 0 0 1 4.5-4.5h4a4.5 4.5 0 0 1 4.5 4.5v2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 14l4 2.5m-4 0l4-2.5" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </div>
        </button>

        {/* --- SEARCH & DIETARY TOOLBAR --- */}
        <section className="space-y-3.5 pt-5 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Bar */}
            <div className="md:col-span-6 lg:col-span-5 relative flex items-center rounded-2xl border border-amber-500/35 bg-[#0C0B12] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 transition duration-200">
              <SearchIcon />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search espresso, cold brew, toasties..."
                className="w-full bg-transparent pl-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-200 transition"
                >
                  <CrossIcon />
                </button>
              )}
            </div>

            {/* Dietary Quick Filter Strip */}
            <div className="md:col-span-6 lg:col-span-7 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              {[
                { id: "all", label: "All Items" },
                { id: "veg", label: "Vegetarian", badge: <VegBadge /> },
                { id: "non-veg", label: "Non-Veg", badge: <NonVegBadge /> },
                { id: "vegan", label: "Vegan", badge: <VeganBadge /> },
                { id: "bestsellers", label: "Bestsellers", icon: <StarIcon /> },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setDietaryFilter(chip.id)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium transition duration-200 ${dietaryFilter === chip.id
                    ? "bg-gradient-to-r from-amber-500/25 to-amber-600/20 text-amber-200 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "bg-[#0F0E17]/90 text-amber-100/70 border border-amber-900/30 hover:border-amber-500/50 hover:text-amber-200"
                    }`}
                >
                  {chip.badge}
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* --- CATEGORIES STICKY NAV --- */}
        <nav className="sticky top-0 z-30 border-b border-amber-500/25 bg-[#030304]/98 pt-3 pb-3 backdrop-blur-3xl shadow-lg my-1">
          <div className="flex items-center justify-start mb-2.5 pl-2 md:hidden">
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-widest animate-pulse flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <span>Scroll to view</span>
              <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
          <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-x-2.5 gap-y-2.5 overflow-x-auto no-scrollbar pb-1">
            {/* "All Items" chip so users can always get back to the full menu */}
            <button
              key="all-items"
              onClick={() => setSelectedCategory("All Items")}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition duration-200 ${selectedCategory === "All Items"
                ? "bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white border border-amber-400/80 shadow-[0_0_15px_rgba(217,119,6,0.4)]"
                : "border border-amber-900/40 bg-[#0F0E17]/80 text-amber-100/70 hover:text-amber-200 hover:border-amber-500/50"
                }`}
            >
              All Items
            </button>

            {/*
              FIX: `categories` comes from /api/categories, which (per the
              Prisma schema) returns objects shaped like { id, name }, not
              plain strings. The previous code did:
                key={cat}                          -> invalid/unstable key
                selectedCategory === cat            -> object vs string, never true
                onClick={() => setSelectedCategory(cat)}  -> stored an object
                {cat}                               -> "Objects are not valid
                                                        as a React child" crash
              which is why the category nav wasn't rendering / working.
              Using cat.id and cat.name fixes all of the above.
            */}
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide transition duration-200 ${isActive
                    ? "bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white border border-amber-400/80 shadow-[0_0_15px_rgba(217,119,6,0.4)]"
                    : "border border-amber-900/40 bg-[#0F0E17]/80 text-amber-100/70 hover:text-amber-200 hover:border-amber-500/50"
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* --- RESPONSIVE MENU GRID (2 COLS MOBILE -> 3 COLS TABLET -> 4 COLS LAPTOP -> 5 COLS XL DESKTOP) --- */}
        <main className="py-6 pb-48">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>{selectedCategory}</span>
              <span className="rounded-full bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                {filteredDishes.length}
              </span>
            </h2>

            {activeOrder && (
              <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                Active Order #{activeOrder.orderId}
              </span>
            )}
          </div>

          {loading ? (
            <div className="my-16 text-center text-slate-400 text-sm">Loading menu…</div>
          ) : filteredDishes.length === 0 ? (
            <div className="my-16 text-center rounded-3xl border border-amber-500/30 bg-[#0F0E16]/80 p-10 shadow-2xl max-w-md mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400 mb-4">
                <SearchIcon />
              </div>
              <p className="text-base font-semibold text-slate-300">No menu items match your search.</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search or dietary filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory("All Items");
                  setSearchQuery("");
                  setDietaryFilter("all");
                }}
                className="mt-5 rounded-xl border border-amber-400/50 bg-amber-500/15 px-5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* --- RESPONSIVE CATEGORY-GROUPED LAYOUT --- */
            <div className="flex flex-col w-full gap-8">
              {(() => {
                const grouped = {};
                filteredDishes.forEach(dish => {
                  if (!grouped[dish.category]) grouped[dish.category] = [];
                  grouped[dish.category].push(dish);
                });
                return Object.entries(grouped).map(([catName, dishesInCat]) => (
                  <div key={catName} className="w-full">
                    <h3 className="text-lg sm:text-xl font-extrabold text-amber-400 tracking-widest uppercase mb-4 pb-2 border-b border-amber-500/20 font-serif drop-shadow-md">
                      {catName}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
                      {dishesInCat.map((dish) => {
                        const inCartItems = cart.filter((item) => item.id === dish.id);
                        const inCartCount = inCartItems.reduce((sum, i) => sum + i.quantity, 0);

                        return (
                          /* --- RESPONSIVE DISH CARD --- */
                          <div
                            key={dish.id}
                            className={`group relative flex flex-col justify-between rounded-2xl border ${dish.available ? "border-amber-500/35 hover:border-amber-400/90 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.25)]" : "border-slate-800 bg-opacity-50 opacity-60"
                              } bg-gradient-to-b from-[#13121C] via-[#0E0C15] to-[#07070B] p-3 sm:p-3.5 transition-all duration-300`}
                          >
                            <div>
                              {/* Image Banner */}
                              <div className="relative h-28 sm:h-36 lg:h-40 w-full overflow-hidden rounded-xl bg-slate-900 border border-amber-500/40 shadow-md">
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className={`h-full w-full object-cover transition duration-300 ${dish.available ? "group-hover:scale-105" : "grayscale opacity-50"}`}
                                  loading="lazy"
                                />

                                {!dish.available && (
                                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                    <span className="rounded-lg bg-rose-950/90 border border-rose-500/60 px-2 py-1 text-[10px] font-extrabold text-rose-300 tracking-wider uppercase shadow-md">
                                      Sold Out / Unavailable
                                    </span>
                                  </div>
                                )}

                                {/* Dietary Badge */}
                                <div className="absolute top-1.5 left-1.5 shadow-md">
                                  {dish.dietary === "veg" && <VegBadge />}
                                  {dish.dietary === "non-veg" && <NonVegBadge />}
                                  {dish.dietary === "vegan" && <VeganBadge />}
                                </div>

                                {/* Bestseller Tag */}
                                {dish.isBestseller && (
                                  <div className="absolute top-1.5 right-1.5 rounded-md bg-amber-500/95 backdrop-blur-md px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold text-black uppercase tracking-wider shadow-md">
                                    BEST
                                  </div>
                                )}

                                {/* Spooky Badge */}
                                {dish.isSpooky && (
                                  <div className="absolute bottom-1.5 right-1.5 rounded-md bg-purple-950/90 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 border border-purple-400/50 shadow-sm flex items-center gap-0.5">
                                    <SkullIcon />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="mt-2.5">
                                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight line-clamp-1 group-hover:text-amber-200 transition">
                                  {dish.name}
                                </h3>

                                <p className="mt-1 text-[10px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {dish.description}
                                </p>

                                <div className="mt-2.5 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium text-slate-400 flex-wrap">
                                  <span className="flex items-center gap-1 bg-[#09080E] px-1.5 py-0.5 rounded-md border border-amber-900/30">
                                    <ClockIcon />
                                    <span className="text-slate-300">{dish.prepTime}</span>
                                  </span>
                                  <span className="flex items-center gap-1 bg-[#09080E] px-1.5 py-0.5 rounded-md border border-amber-900/30">
                                    <FlameIcon />
                                    <span className="text-slate-300">{dish.calories}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Footer Row */}
                            <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-amber-900/30">
                              <div className="flex items-baseline gap-0.5">
                                <span className="text-[11px] sm:text-xs font-bold text-amber-400">₹</span>
                                <span className="text-xs sm:text-sm font-extrabold text-white drop-shadow">{dish.price}</span>
                              </div>

                              {!dish.available ? (
                                <button
                                  disabled
                                  className="rounded-xl bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-500 cursor-not-allowed"
                                >
                                  UNAVAILABLE
                                </button>
                              ) : inCartCount === 0 ? (
                                <button
                                  onClick={() => handleOpenCustomization(dish)}
                                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 border border-amber-400/50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-[0_0_10px_rgba(217,119,6,0.35)] transition duration-200 hover:brightness-110 active:scale-95"
                                >
                                  <span>ADD</span>
                                  <PlusIcon />
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded-xl border border-amber-400/70 bg-amber-950/60 px-1.5 py-0.5 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                                  <button
                                    onClick={() => {
                                      if (inCartItems.length > 0) {
                                        updateCartQuantity(inCartItems[0].cartItemId, -1);
                                      }
                                    }}
                                    className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-[10px] font-bold text-amber-400 border border-amber-500/40 hover:bg-slate-800 active:scale-90"
                                  >
                                    <MinusIcon />
                                  </button>
                                  <span className="text-xs font-extrabold text-white min-w-[10px] text-center">
                                    {inCartCount}
                                  </span>
                                  <button
                                    onClick={() => handleOpenCustomization(dish)}
                                    className="flex h-5 w-5 items-center justify-center rounded bg-amber-600 text-[10px] font-bold text-white hover:bg-amber-500 active:scale-90"
                                  >
                                    <PlusIcon />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </main>
      </div>

      {/* --- FLOATING CART BAR (CENTERED ON LARGE SCREENS) --- */}
      {totalCartItemsCount > 0 && (
        <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 py-2 pointer-events-none">
          <div className="mx-auto max-w-sm pointer-events-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 border border-amber-400/60 py-3 px-4 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] transition hover:brightness-110 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/50 font-extrabold text-[10px] text-amber-300 border border-amber-400/40">
                  {totalCartItemsCount}
                </span>
                <div className="text-left">
                  <p className="text-[11px] sm:text-xs font-bold text-amber-50 flex items-center gap-1.5">
                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                    <span>View Order Summary</span>
                  </p>
                  <p className="text-[9px] text-amber-200/80 mt-0.5">Table #{tablenumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight">₹{grandTotal}</span>
                <span className="text-[10px] font-bold">→</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* --- STATIC BOTTOM NAVIGATION PILL --- */}
      <div className="fixed bottom-0 left-0 right-0 z-[50] p-4 pointer-events-none flex justify-center bg-gradient-to-t from-[#030304] via-[#030304]/80 to-transparent">
        <div className="pointer-events-auto flex items-center justify-between gap-1 rounded-full bg-[#16131F]/90 backdrop-blur-3xl border border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] w-full max-w-sm relative">

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-l-full py-2 bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 hover:text-amber-300 transition relative"
          >
            <div className="relative">
              <ShoppingBagIcon />
              {totalCartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-extrabold text-black">
                  {totalCartItemsCount}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Cart</span>
          </button>

          <div className="w-[1px] h-6 bg-amber-900/40"></div>

          <button
            onClick={async () => {
              await fetchSessionOrders();
              setIsOrdersModalOpen(true);
            }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-r-full py-2 text-slate-400 hover:text-amber-400 transition hover:bg-white/5 relative"
          >
            <div className="relative">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {(activeOrder || sessionOrders.some(o => !["served", "completed"].includes(o.status.toLowerCase()))) && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-emerald-500 border border-[#16131F] animate-pulse"></span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Orders</span>
          </button>

        </div>
      </div>

      {/* --- CUSTOMIZATION MODAL SHEET --- */}
      {customizingDish && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-amber-500/50 bg-gradient-to-b from-[#13121C] via-[#0E0C15] to-[#07070B] p-5 text-slate-100 shadow-[0_0_40px_rgba(245,158,11,0.2)] animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-amber-500/30 pb-3.5">
              <div className="flex gap-3 items-center">
                <img
                  src={customizingDish.image}
                  alt={customizingDish.name}
                  className="h-12 w-12 rounded-xl object-cover border border-amber-400/50 bg-slate-900 shadow-md"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Customise {customizingDish.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    Base Price: ₹{customizingDish.price}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomizingDish(null)}
                className="rounded-full bg-amber-950/50 border border-amber-500/30 p-1.5 text-slate-400 hover:text-white"
              >
                <CrossIcon />
              </button>
            </div>

            {/* Customization Options Body */}
            <div className="my-4 max-h-[55vh] overflow-y-auto space-y-4 pr-1 text-xs no-scrollbar">
              {/* Temperature option */}
              {customizingDish.options?.temperature && (
                <div>
                  <label className="mb-2 block font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                    Serving Temperature
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingDish.options.temperature.map((temp) => (
                      <button
                        key={temp}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, temperature: temp }))
                        }
                        className={`rounded-xl border p-2.5 text-center font-semibold transition ${selectedOptions.temperature === temp
                          ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "border-amber-900/30 bg-[#09080E] text-slate-400"
                          }`}
                      >
                        {temp === "Hot" ? "☕ Hot" : "🧊 Iced"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Milk Option */}
              {customizingDish.options?.milk && (
                <div>
                  <label className="mb-2 block font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                    Milk Choice
                  </label>
                  <div className="space-y-1.5">
                    {customizingDish.options.milk.map((m) => (
                      <button
                        key={m.name}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, milk: m.name }))
                        }
                        className={`flex w-full items-center justify-between rounded-xl border p-2.5 font-medium transition ${selectedOptions.milk === m.name
                          ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "border-amber-900/30 bg-[#09080E] text-slate-400"
                          }`}
                      >
                        <span>{m.name}</span>
                        <span className="text-amber-400 font-semibold">{m.price > 0 ? `+₹${m.price}` : "Free"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sweetness Option */}
              {customizingDish.options?.sweetness && (
                <div>
                  <label className="mb-2 block font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                    Sweetness Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {customizingDish.options.sweetness.map((sw) => (
                      <button
                        key={sw}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, sweetness: sw }))
                        }
                        className={`rounded-xl border p-2 text-center font-medium transition ${selectedOptions.sweetness === sw
                          ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "border-amber-900/30 bg-[#09080E] text-slate-400"
                          }`}
                      >
                        {sw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bread Choice */}
              {customizingDish.options?.bread && (
                <div>
                  <label className="mb-2 block font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                    Bread Choice
                  </label>
                  <div className="space-y-1.5">
                    {customizingDish.options.bread.map((b) => (
                      <button
                        key={b}
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, bread: b }))
                        }
                        className={`flex w-full items-center justify-between rounded-xl border p-2.5 font-medium transition ${selectedOptions.bread === b
                          ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "border-amber-900/30 bg-[#09080E] text-slate-400"
                          }`}
                      >
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Option */}
              {customizingDish.options?.addOns && (
                <div>
                  <label className="mb-2 block font-bold text-amber-300 uppercase tracking-wider text-[10px]">
                    Extra Add-ons
                  </label>
                  <div className="space-y-1.5">
                    {customizingDish.options.addOns.map((addOn) => {
                      const isSelected = selectedOptions.addOns?.includes(addOn.name);
                      return (
                        <button
                          key={addOn.name}
                          onClick={() => {
                            setSelectedOptions((prev) => {
                              const curr = prev.addOns || [];
                              const updated = isSelected
                                ? curr.filter((a) => a !== addOn.name)
                                : [...curr, addOn.name];
                              return { ...prev, addOns: updated };
                            });
                          }}
                          className={`flex w-full items-center justify-between rounded-xl border p-2.5 font-medium transition ${isSelected
                            ? "border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : "border-amber-900/30 bg-[#09080E] text-slate-400"
                            }`}
                        >
                          <span>{addOn.name}</span>
                          <span className="text-amber-400 font-semibold">+₹{addOn.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Add Button */}
            <div className="border-t border-amber-500/30 pt-3">
              <button
                onClick={handleConfirmCustomization}
                className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-400/60 p-3.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] transition hover:from-amber-500 hover:to-amber-600 active:scale-95"
              >
                <span>Add Item to Order</span>
                <span>₹{calculateCustomPrice(customizingDish, selectedOptions)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CALL WAITER MODAL --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/50 bg-gradient-to-b from-[#13121C] via-[#0E0C15] to-[#07070B] p-5 text-slate-100 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BellIcon />
                <span>Call Waiter</span>
                <span className="text-xs text-amber-400 font-medium">(Table #{tablenumber})</span>
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="rounded-full bg-amber-950/50 border border-amber-500/30 p-1.5 text-slate-400 hover:text-white"
              >
                <CrossIcon />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400">Select what you need and server will arrive shortly:</p>

            <div className="mt-4 space-y-2.5 text-xs font-medium">
              {[
                { label: "Water Bottle Request", value: "Water Bottle" },
                { label: "Extra Tissues & Cutlery", value: "Tissues & Cutlery" },
                { label: "Call Server to Table", value: "Table Assistance" },
                { label: "Request Final Bill", value: "Bill Request" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => triggerServiceRequest(opt.value)}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-500/35 bg-[#09080E] p-3 text-slate-200 transition hover:border-amber-400 hover:bg-amber-950/30 active:scale-98"
                >
                  <span>{opt.label}</span>
                  <span className="text-amber-400 font-bold">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-amber-500/50 bg-gradient-to-b from-[#13121C] via-[#0E0C15] to-[#07070B] p-5 text-slate-100 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Your Cafe Order</h3>
                <p className="text-xs text-amber-400">Rest In Peace Cafe • Table #{tablenumber}</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full bg-amber-950/50 border border-amber-500/30 p-1.5 text-slate-400 hover:text-white"
              >
                <CrossIcon />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 no-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="h-16 w-16 mb-4 rounded-full bg-amber-950/30 border border-amber-500/30 flex items-center justify-center">
                    <ShoppingBagIcon />
                  </div>
                  <p className="font-bold text-amber-100">Your cart is empty</p>
                  <p className="text-xs mt-1 text-center px-4">Add some items from the menu to get started.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="flex items-start justify-between rounded-xl border border-amber-500/30 bg-[#09080E] p-3"
                  >
                    <div className="flex gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg object-cover bg-slate-800 shrink-0 border border-amber-500/40"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                        {item.customizations && (
                          <p className="text-[10px] text-amber-300/80 mt-0.5 line-clamp-1">
                            {item.customizations}
                          </p>
                        )}
                        <p className="text-xs font-bold text-amber-400 mt-1">₹{item.unitPrice}</p>
                      </div>
                    </div>

                    {/* Item Quantity Modifier */}
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-black/60 px-2 py-1 shrink-0 ml-2">
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, -1)}
                        className="text-xs font-extrabold text-amber-400 hover:text-white"
                      >
                        <MinusIcon />
                      </button>
                      <span className="text-xs font-bold text-white min-w-[12px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, 1)}
                        className="text-xs font-extrabold text-amber-400 hover:text-white"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                )))}

              {cart.length > 0 && (
                <>
                  {/* Kitchen Special Notes */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Kitchen Notes / Special Instructions
                    </label>
                    <input
                      type="text"
                      value={kitchenNotes}
                      onChange={(e) => setKitchenNotes(e.target.value)}
                      placeholder="e.g. Extra hot coffee, less sugar, allergen alerts..."
                      className="w-full rounded-xl border border-amber-500/35 bg-[#09080E] px-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Customer info note in cart if registered */}
                  {customerName && (
                    <div className="flex items-center justify-between px-1 py-1 text-[11px] text-slate-400">
                      <span className="truncate">Ordering as: <span className="font-semibold text-amber-300">{customerName}</span> ({customerPhone})</span>
                      <button
                        onClick={() => {
                          setRegName(customerName);
                          setRegPhone(customerPhone);
                          setRegError("");
                          setIsCustomerModalOpen(true);
                        }}
                        className="text-amber-400 hover:text-amber-300 underline font-medium text-[10px] ml-2 shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {/* Bill Breakdown */}
                  <div className="rounded-xl border border-amber-500/35 bg-[#09080E] p-3 space-y-1.5 text-xs text-slate-400 mt-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-200">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST & Service Charge (5%)</span>
                      <span className="font-semibold text-slate-200">₹{taxAmount}</span>
                    </div>
                    <div className="border-t border-amber-900/30 pt-2 flex justify-between font-bold text-sm text-white">
                      <span>Total Amount</span>
                      <span className="text-amber-400">₹{grandTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Place Order Button */}
            {cart.length > 0 && (
              <button
                onClick={handleInitiateOrder}
                disabled={orderSubmitting}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-400/60 p-3.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] transition hover:from-amber-500 hover:to-amber-600 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {orderSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Placing Order…</span>
                  </>
                ) : (
                  <>
                    <span>Send Order to Kitchen</span>
                    <span>•</span>
                    <span>₹{grandTotal}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- LIVE KITCHEN ORDER TRACKER MODAL --- */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/50 bg-gradient-to-b from-[#13121C] via-[#0E0C15] to-[#07070B] p-6 text-slate-100 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-950/40 text-2xl shadow-[0_0_15px_rgba(245,158,11,0.25)] mb-3">
              ☕
            </div>

            <h3 className="text-base font-extrabold text-white">Order Sent to Kitchen!</h3>
            <p className="text-xs font-semibold text-amber-400 mt-1">
              Order ID: #{activeOrder.orderId} • Table #{activeOrder.table}
            </p>

            {/* Status Stepper */}
            <div className="my-5 space-y-3.5 text-left border-y border-amber-500/30 py-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                  <CheckIcon />
                </div>
                <div>
                  <p className="font-bold text-white">Order Received</p>
                  <p className="text-[10px] text-slate-500">Placed at {activeOrder.placedAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-[10px] ${activeOrder.status === "preparing" || activeOrder.status === "ready"
                    ? "bg-amber-400 text-black animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    : "bg-slate-800 text-slate-500"
                    }`}
                >
                  {activeOrder.status === "ready" ? <CheckIcon /> : "2"}
                </div>
                <div>
                  <p
                    className={`font-bold ${activeOrder.status === "preparing" || activeOrder.status === "ready"
                      ? "text-white"
                      : "text-slate-500"
                      }`}
                  >
                    Preparing in Kitchen
                  </p>
                  <p className="text-[10px] text-slate-500">Barista & Chef are crafting your order</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-[10px] ${activeOrder.status === "ready"
                    ? "bg-emerald-500 text-black"
                    : "bg-slate-800 text-slate-500"
                    }`}
                >
                  {activeOrder.status === "ready" ? <CheckIcon /> : "3"}
                </div>
                <div>
                  <p
                    className={`font-bold ${activeOrder.status === "ready" ? "text-emerald-400" : "text-slate-500"
                      }`}
                  >
                    Ready to Serve
                  </p>
                  <p className="text-[10px] text-slate-500">Will be brought directly to Table #{activeOrder.table}</p>
                </div>
              </div>
            </div>

            {/* Kitchen Note Callout */}
            {activeOrder.notes && (
              <div className="my-3 rounded-xl bg-amber-950/40 border border-amber-500/30 px-3 py-2 text-left text-xs text-amber-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block font-mono">📝 Kitchen Note:</span>
                <p className="italic text-slate-100 mt-0.5 font-medium">"{activeOrder.notes}"</p>
              </div>
            )}

            {(() => {
              const activeCreatedTime = activeOrder.placedTimeClientMs || (activeOrder.createdAt ? new Date(activeOrder.createdAt).getTime() : Date.now());
              const activeRemainingSecs = Math.max(0, 70 - Math.floor((Date.now() - activeCreatedTime) / 1000));
              const statusLower = (activeOrder.status || "").toLowerCase();
              const canCancelActive = activeRemainingSecs > 0 && (statusLower === "received" || statusLower === "pending");

              if (canCancelActive) {
                return (
                  <div className="my-4 pt-4 border-t border-amber-500/20 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium font-sans">
                      Can cancel order within: <span className="text-amber-400 font-mono font-bold">{activeRemainingSecs}s</span>
                    </span>
                    <button
                      onClick={() => handleCancelOrder(activeOrder.id)}
                      className="w-full rounded-xl border border-rose-500/40 bg-rose-955 bg-gradient-to-r from-rose-900/40 to-rose-950/40 py-2.5 text-xs font-bold text-rose-300 hover:brightness-110 transition active:scale-95 font-sans animate-pulse"
                    >
                      Cancel Order
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            <button
              onClick={() => setActiveOrder(null)}
              className="w-full rounded-xl bg-[#0A090E] border border-amber-500/40 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-950/40 transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              Order More Items
            </button>
          </div>
        </div>
      )}

      {/* --- SESSION ORDERS MODAL SHEET --- */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4">
          <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-amber-500/50 bg-[#0D0C14] p-5 text-slate-100 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Your Orders History</h3>
                <p className="text-xs text-amber-400">Rest In Peace Cafe • Session #{sessionId}</p>
              </div>
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="rounded-full bg-amber-950/50 border border-amber-500/30 p-1.5 text-slate-400 hover:text-white"
              >
                <CrossIcon />
              </button>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto my-3 space-y-4 pr-1 no-scrollbar">
              {sessionOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="h-16 w-16 mb-4 rounded-full bg-amber-950/30 border border-amber-500/30 flex items-center justify-center text-xl">
                    🛎️
                  </div>
                  <p className="font-bold text-amber-100">No orders placed yet</p>
                  <p className="text-xs mt-1 text-center px-4">Your placed orders for this session will appear here.</p>
                </div>
              ) : (
                sessionOrders.map((order) => {
                  const itemsCount = order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                  const orderDate = new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const createdTime = new Date(order.createdAt).getTime();
                  const remainingSecs = Math.max(0, 70 - Math.floor((Date.now() - createdTime) / 1000));
                  const canCancel = remainingSecs > 0 && (order.status.toLowerCase() === "received" || order.status.toLowerCase() === "pending");

                  // Status style config
                  let statusLabel = "Received";
                  let statusClass = "bg-amber-500/10 border-amber-500/30 text-amber-300";
                  if (order.status.toLowerCase() === "preparing") {
                    statusLabel = "Preparing";
                    statusClass = "bg-blue-500/10 border-blue-500/30 text-blue-300 animate-pulse";
                  } else if (order.status.toLowerCase() === "ready") {
                    statusLabel = "Ready to Serve";
                    statusClass = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]";
                  } else if (order.status.toLowerCase() === "served" || order.status.toLowerCase() === "completed") {
                    statusLabel = "Served ✓";
                    statusClass = "bg-slate-800 border-slate-700 text-slate-400";
                  } else if (order.status.toLowerCase() === "cancelled") {
                    statusLabel = "Cancelled";
                    statusClass = "bg-rose-500/10 border-rose-500/30 text-rose-400";
                  }

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-amber-500/20 bg-[#07060A] p-4 font-sans shadow-md"
                    >
                      {/* Top Row: Order ID & Status */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">ORDER ID</span>
                          <span className="text-xs font-mono font-bold text-amber-400 font-mono">RIP-{order.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-right font-sans">STATUS</span>
                          <span className={`inline-block rounded-lg border px-2 py-0.5 text-[9px] font-bold uppercase font-sans ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>

                      {/* Items Details */}
                      <div className="space-y-2 mb-3">
                        {order.orderItems?.map((item) => (
                          <div key={item.id} className="text-xs font-sans">
                            <div className="flex justify-between">
                              <span className="text-slate-300">
                                {item.dish?.name || "Dish Item"}{" "}
                                <span className="text-slate-500 text-[10px]">x{item.quantity}</span>
                              </span>
                              <span className="text-slate-400 font-mono">₹{Number(item.price) * item.quantity}</span>
                            </div>
                            {item.customizations && (
                              <p className="text-[10px] text-amber-300/70 mt-0.5 ml-1">
                                ↳ {item.customizations}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Kitchen Special Notes */}
                      {order.notes && (
                        <div className="mb-3 rounded-lg bg-amber-950/30 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-200 flex items-start gap-1.5">
                          <span className="shrink-0 text-amber-400">📝</span>
                          <span className="italic leading-snug"><strong className="not-italic text-amber-300">Kitchen Note:</strong> {order.notes}</span>
                        </div>
                      )}

                      {/* Summary Row */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-white/5 text-[11px] font-sans">
                        <span className="text-slate-500">Placed at {orderDate} · {itemsCount} items</span>
                        <div className="font-bold text-white">
                          Total: <span className="text-amber-400 text-xs font-mono">₹{Number(order.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Cancel Order Action */}
                      {canCancel && (
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium font-sans">
                            Can cancel within: <span className="text-amber-400 font-mono font-bold">{remainingSecs}s</span>
                          </span>
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-lg border border-rose-500/40 bg-rose-950/20 px-3 py-1.5 text-[10px] font-bold text-rose-300 hover:bg-rose-900/40 transition active:scale-95 font-sans animate-pulse"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setIsOrdersModalOpen(false)}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-400/60 py-3 text-xs font-bold text-slate-100 hover:brightness-110 active:scale-98 transition shadow-[0_0_15px_rgba(217,119,6,0.3)] font-sans"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* --- CUSTOM CANCELLATION CONFIRMATION MODAL --- */}
      {orderToCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs rounded-2xl border border-rose-500/40 bg-gradient-to-b from-[#1E1116] to-[#0A0507] p-5 text-center shadow-[0_0_30px_rgba(239,68,68,0.25)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-rose-450 bg-rose-950/40 text-rose-400 text-lg mb-3">
              ☠️
            </div>
            <h4 className="text-sm font-extrabold text-white">Cancel Order</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 rounded-xl border border-slate-700 bg-[#0F0E17] py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                No, Keep
              </button>
              <button
                onClick={async () => {
                  const id = orderToCancel;
                  setOrderToCancel(null);
                  await executeCancelOrder(id);
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-650 to-rose-750 border border-rose-500/50 py-2 text-xs font-bold text-white shadow-md hover:from-rose-500 hover:to-rose-600 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOMER DETAILS MODAL (ASKED AT THE TIME OF PLACING ORDER) --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#16131F] via-[#0E0C15] to-[#050508] p-6 sm:p-7 shadow-[0_10px_60px_rgba(0,0,0,0.9)]">
            {/* Close Button */}
            <button
              onClick={() => setIsCustomerModalOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-amber-950/50 border border-amber-500/30 p-1.5 text-slate-400 hover:text-white transition"
            >
              <CrossIcon />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center gap-2 mb-5 text-center">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-md pointer-events-none" />
                <img
                  src="/logo.png"
                  alt="Rest In Peace Cafe Logo"
                  className="w-full h-full object-contain drop-shadow-md"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-wider uppercase font-serif gold-gradient-text drop-shadow">
                Customer Details
              </h3>
              <p className="text-[11px] text-slate-400 max-w-[260px]">
                Please enter your details to send your order to the kitchen for <span className="text-amber-300 font-semibold">Table #{tablenumber}</span>.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCustomerFormSubmit} className="space-y-3.5">
              {/* Name Field */}
              <div>
                <label htmlFor="modal-reg-name" className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <div className="relative flex items-center rounded-2xl border border-amber-500/35 bg-[#0C0B12] px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 transition duration-200">
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    id="modal-reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="modal-reg-phone" className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative flex items-center rounded-2xl border border-amber-500/35 bg-[#0C0B12] px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 transition duration-200">
                  <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input
                    id="modal-reg-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Kitchen Notes / Special Instructions Field in Customer Form */}
              <div>
                <label htmlFor="modal-reg-notes" className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Kitchen Note / Special Request (Optional)
                </label>
                <div className="relative flex items-center rounded-2xl border border-amber-500/35 bg-[#0C0B12] px-3.5 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/50 transition duration-200">
                  <span className="text-amber-400 mr-2 text-xs">📝</span>
                  <input
                    id="modal-reg-notes"
                    type="text"
                    value={kitchenNotes}
                    onChange={(e) => setKitchenNotes(e.target.value)}
                    placeholder="e.g. Extra hot, less sweet, allergy info..."
                    className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {regError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300 text-center">
                  {regError}
                </div>
              )}

              {/* Order Summary Pill inside form */}
              <div className="flex items-center justify-between rounded-xl bg-amber-950/30 border border-amber-500/20 px-3 py-2 text-xs text-amber-200">
                <span>{totalCartItemsCount} item{totalCartItemsCount > 1 ? "s" : ""} in order</span>
                <span className="font-bold font-mono text-amber-400">Total: ₹{grandTotal}</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={regSubmitting || orderSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 border border-amber-400/60 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] transition duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {regSubmitting || orderSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Placing Order…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Place Order (₹{grandTotal})</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-3 text-[9px] text-slate-500 text-center">
              Your contact details will only be used to update you on your orders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}