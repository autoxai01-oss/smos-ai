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

export default function CustomerMenu() {
  const params = useParams();
  const searchParams = useSearchParams();

  const restaurantId = params.restaurantId as string;
  const table = searchParams.get("table"); // 🔥 AUTO TABLE FROM URL

  const [menu, setMenu] = useState<any[]>([]);
  const [enteredPin, setEnteredPin] = useState("");
  const [verified, setVerified] = useState(false);

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

  // 🍔 LOAD MENU ONLY AFTER VERIFIED
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
  }, [verified]);

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
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">🍽 Menu</h1>

      {menu.map(item => (
        <div
          key={item.id}
          className="bg-gray-800 p-3 mb-2 rounded flex justify-between"
        >
          <span>{item.name}</span>
          <span>₹{item.price}</span>
        </div>
      ))}

    </div>
  );
}