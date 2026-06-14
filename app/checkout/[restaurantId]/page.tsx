"use client";

import { useEffect, useState } from "react";
import { getCart, clearCart } from "@/lib/cart";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function Checkout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();
  const params = useSearchParams();

  const restaurantId = params.get("restaurantId");
  const table = params.get("table");

  useEffect(() => {
    setCart(getCart());
  }, []);

  // 🔥 PLACE ORDER (NO MERGE SYSTEM)
  const placeOrder = async () => {
    if (!restaurantId || !table) {
      alert("Missing restaurant or table");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      // 🔥 CONVERT QTY → INDIVIDUAL ITEMS
      const newItems = cart.flatMap((item) => {
        return Array.from({ length: item.qty }).map(() => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1 // ALWAYS 1
        }));
      });

      // 🔥 SAVE AS NEW ORDER (NEVER UPDATE OLD ORDER)
      await addDoc(
        collection(db, "restaurants", restaurantId, "orders"),
        {
          tableId: table,
          items: newItems,
          createdAt: serverTimestamp()
        }
      );

      clearCart();

      alert("Order placed successfully");

      router.push(`/menu/${restaurantId}?table=${table}`);

    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div className="min-h-screen bg-[#f8f5f0] p-6 text-gray-800">

      <h1 className="text-2xl font-bold mb-6 text-center">
        Checkout
      </h1>

      <div className="max-w-md mx-auto bg-white p-4 rounded-xl shadow">

        {cart.map((item) => (
          <div
            key={item.id}
            className="flex justify-between mb-2"
          >
            <span>
              {item.name} x {item.qty}
            </span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}

        <div className="border-t mt-4 pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <button
          onClick={placeOrder}
          className="w-full mt-4 bg-green-600 text-white p-3 rounded-lg"
        >
          Place Order
        </button>

      </div>

    </div>
  );
}