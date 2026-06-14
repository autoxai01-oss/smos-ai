"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getCart, clearCart } from "@/lib/cart";

// ✅ TYPES
type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function Checkout() {
  const params = useParams();
  const searchParams = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const table = searchParams.get("table");

  const [loading, setLoading] = useState(false);

  const cart = getCart() as CartItem[];

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // 🔥 MAIN FUNCTION (REPEAT ORDER LOGIC)
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      const ordersRef = collection(
        db,
        "restaurants",
        restaurantId,
        "orders"
      );

      // 🔍 CHECK EXISTING ACTIVE ORDER
      const q = query(
        ordersRef,
        where("tableId", "==", table),
        where("isActive", "==", true)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        // 🔥 UPDATE EXISTING ORDER
        const existingOrder = snap.docs[0];
        const existingData = existingOrder.data();

        let updatedItems = [...existingData.items];

        cart.forEach((newItem: CartItem) => {
          const found = updatedItems.find(
            (i: CartItem) => i.id === newItem.id
          );

          if (found) {
            found.qty += newItem.qty;
          } else {
            updatedItems.push(newItem);
          }
        });

        const newTotal = updatedItems.reduce(
          (sum: number, item: CartItem) =>
            sum + item.price * item.qty,
          0
        );

        await updateDoc(
          doc(
            db,
            "restaurants",
            restaurantId,
            "orders",
            existingOrder.id
          ),
          {
            items: updatedItems,
            total: newTotal,
          }
        );

      } else {
        // 🆕 CREATE NEW ORDER
        await addDoc(ordersRef, {
          tableId: table,
          items: cart,
          total,
          status: "pending",
          isActive: true, // 🔥 KEY FIELD
          createdAt: serverTimestamp(),
        });
      }

      clearCart();
      alert("Order updated successfully!");

    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">🛒 Checkout</h1>

      {cart.length === 0 && (
        <p className="text-center text-gray-400">
          Cart is empty
        </p>
      )}

      {cart.map((item) => (
        <div
          key={item.id}
          className="bg-gray-800 p-3 mb-2 rounded flex justify-between"
        >
          <span>{item.name} x {item.qty}</span>
          <span>₹{item.price * item.qty}</span>
        </div>
      ))}

      <h2 className="text-xl mt-4">Total: ₹{total}</h2>

      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full bg-green-500 p-3 mt-6 rounded"
      >
        {loading ? "Processing..." : "Place / Update Order"}
      </button>

    </div>
  );
}