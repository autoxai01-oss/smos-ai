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
import { addToCart } from "@/lib/cart";
import CartBar from "@/components/CartBar";

export default function CustomerMenu() {
  const params = useParams();
  const searchParams = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const table = searchParams.get("table");

  const [menu, setMenu] = useState<any[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 VERIFY PIN
  const verifyPin = async () => {
    if (!enteredPin) {
      alert("Enter PIN");
      return;
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "tablePins"),
        where("restaurantId", "==", restaurantId),
        where("tableNumber", "==", table)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("Invalid table");
        setLoading(false);
        return;
      }

      const data = snap.docs[0].data();

      if (data.pin === enteredPin) {
        setVerified(true);
      } else {
        alert("Wrong PIN");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  // 🍔 LOAD MENU AFTER VERIFIED
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
            className="w-full p-2 mb-3 bg-gray-800 rounded outline-none"
          />

          <button
            onClick={verifyPin}
            disabled={loading}
            className="w-full bg-green-500 p-2 rounded"
          >
            {loading ? "Checking..." : "Enter Menu"}
          </button>

        </div>
      </div>
    );
  }

  // 🛒 ADD TO CART HANDLER
  const handleAdd = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
    });

    // simple feedback
    alert(`${item.name} added`);
  };

  // 🍽 MENU UI
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">

      <h1 className="text-3xl mb-6 text-center">🍽 Menu</h1>

      {menu.length === 0 && (
        <p className="text-center text-gray-400">No items available</p>
      )}

      {menu.map(item => (
        <div
          key={item.id}
          className="bg-gray-800 p-4 mb-3 rounded flex justify-between items-center"
        >
          <div>
            <p className="text-lg">{item.name}</p>
            <p className="text-sm text-gray-400">₹{item.price}</p>
          </div>

          <button
            onClick={() => handleAdd(item)}
            className="bg-green-500 px-4 py-1 rounded"
          >
            Add
          </button>
        </div>
      ))}

      {/* 🛒 CART BAR */}
      <CartBar restaurantId={restaurantId} />

    </div>
  );
}