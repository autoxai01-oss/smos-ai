"use client";

import { getCart, clearCart } from "@/lib/cart";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    setLoading(true);

    try {
      await addDoc(
        collection(db, "restaurants", restaurantId, "orders"),
        {
          tableId: table,
          items: cart,
          total,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      );

      clearCart();
      alert("Order placed successfully!");

      window.location.reload(); // refresh
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">🛒 Checkout</h1>

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
        {loading ? "Placing..." : "Place Order"}
      </button>

    </div>
  );
}