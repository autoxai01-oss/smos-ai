"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { addToCart, getCart, updateQty } from "@/lib/cart";
import CartBar from "@/components/CartBar";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function CustomerMenu() {
  const params = useParams();
  const searchParams = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const table = searchParams.get("table");

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // 🔐 VERIFY PIN
  const verifyPin = async () => {
    if (!enteredPin) return alert("Enter PIN");

    const q = query(
      collection(db, "tablePins"),
      where("restaurantId", "==", restaurantId),
      where("tableNumber", "==", table)
    );

    const snap = await getDocs(q);

    if (snap.empty) return alert("Invalid table");

    const data = snap.docs[0].data();

    if (data.pin === enteredPin) {
      setVerified(true);
    } else {
      alert("Wrong PIN");
    }
  };

  // 🍔 LOAD MENU
  useEffect(() => {
    if (!verified) return;

    const q = query(
      collection(db, "menu"),
      where("restaurantId", "==", restaurantId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMenu(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MenuItem, "id">),
        }))
      );
    });

    return () => unsub();
  }, [verified, restaurantId]);

  // 🔐 PIN SCREEN (CREAMY STYLE)
  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">

        <div className="bg-white p-8 rounded-2xl w-80 text-center shadow-lg">

          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            Table {table}
          </h1>

          <input
            placeholder="Enter PIN"
            value={enteredPin}
            onChange={(e)=>setEnteredPin(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg"
          />

          <button
            onClick={verifyPin}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
          >
            Enter Menu
          </button>

        </div>

      </div>
    );
  }

  // 🍽 MENU UI (PREMIUM)
  return (
    <div className="min-h-screen bg-[#f8f5f0] text-gray-800 p-6 pb-24">

      <h1 className="text-3xl font-bold text-center mb-8">
        🍽 Our Menu
      </h1>

      <div className="space-y-4 max-w-xl mx-auto">

        {menu.map((item) => {
          const cart = getCart() as CartItem[];
          const cartItem = cart.find((i: CartItem) => i.id === item.id);

          return (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">
                  ₹{item.price}
                </p>
              </div>

              {!cartItem ? (
                <button
                  onClick={() => {
                    addToCart(item);
                    setRefresh(!refresh);
                  }}
                  className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 transition"
                >
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-lg">

                  <button
                    onClick={() => {
                      updateQty(item.id, "dec");
                      setRefresh(!refresh);
                    }}
                    className="text-lg px-2"
                  >
                    −
                  </button>

                  <span className="font-semibold">
                    {cartItem.qty}
                  </span>

                  <button
                    onClick={() => {
                      updateQty(item.id, "inc");
                      setRefresh(!refresh);
                    }}
                    className="text-lg px-2"
                  >
                    +
                  </button>

                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* 🛒 CART BAR */}
      <CartBar restaurantId={restaurantId} />

    </div>
  );
}