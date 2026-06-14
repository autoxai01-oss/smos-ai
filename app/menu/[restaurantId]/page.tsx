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

export default function CustomerMenu() {
  const params = useParams();
  const searchParams = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const table = searchParams.get("table");

  const [menu, setMenu] = useState<any[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [refresh, setRefresh] = useState(false); // 🔥 force UI update

  // 🔐 VERIFY PIN
  const verifyPin = async () => {
    if (!enteredPin) {
      alert("Enter PIN");
      return;
    }

    const q = query(
      collection(db, "tablePins"),
      where("restaurantId", "==", restaurantId),
      where("tableNumber", "==", table)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Invalid table");
      return;
    }

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
      setMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [verified, restaurantId]);

  // 🔐 PIN SCREEN
  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">

          <h1 className="text-xl mb-3">🔐 Table {table}</h1>

          <input
            placeholder="Enter PIN"
            value={enteredPin}
            onChange={(e)=>setEnteredPin(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-800 rounded"
          />

          <button
            onClick={verifyPin}
            className="w-full bg-green-500 p-2 rounded"
          >
            Enter Menu
          </button>

        </div>
      </div>
    );
  }

  // 🍽 MENU
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">

      <h1 className="text-3xl mb-6 text-center">🍽 Menu</h1>

      {menu.map(item => {
        const cart = getCart();
        const cartItem = cart.find(i => i.id === item.id);

        return (
          <div
            key={item.id}
            className="bg-gray-800 p-4 mb-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="text-lg">{item.name}</p>
              <p className="text-sm text-gray-400">₹{item.price}</p>
            </div>

            {/* 🔥 DYNAMIC BUTTON */}
            {!cartItem ? (
              <button
                onClick={() => {
                  addToCart(item);
                  setRefresh(!refresh);
                }}
                className="bg-green-500 px-4 py-1 rounded"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-gray-700 px-3 py-1 rounded">

                <button
                  onClick={() => {
                    updateQty(item.id, "dec");
                    setRefresh(!refresh);
                  }}
                  className="text-lg px-2"
                >
                  -
                </button>

                <span>{cartItem.qty}</span>

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

      {/* 🛒 CART BAR */}
      <CartBar restaurantId={restaurantId} />

    </div>
  );
}