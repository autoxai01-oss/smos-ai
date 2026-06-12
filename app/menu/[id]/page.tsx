"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";

export default function MenuPage() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ CHECK PIN
  const checkPin = async () => {
    const ref = doc(db, "restaurants", id as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Restaurant not found");
      return;
    }

    const data = snap.data();

    if (data.pin === pin) {
      setAuthorized(true);
      loadMenu();
    } else {
      alert("Wrong PIN ❌");
    }
  };

  // ✅ LOAD MENU
  const loadMenu = async () => {
    const querySnap = await getDocs(
      collection(db, "restaurants", id as string, "items")
    );

    const data = querySnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setItems(data);
    setLoading(false);
  };

  // 🔒 PIN SCREEN
  if (!authorized) {
    return (
      <div style={{ textAlign: "center", marginTop: 200 }}>
        <h2>Enter Table PIN</h2>

        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <br />

        <button onClick={checkPin}>Enter</button>
      </div>
    );
  }

  // ⏳ LOADING
  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  // 🍽 MENU
  return (
    <div style={{ padding: 30 }}>
      <h1>Menu</h1>

      {items.length === 0 ? (
        <p>No items available</p>
      ) : (
        items.map((item) => (
          <div key={item.id}>
            {item.name} - ₹{item.price}
          </div>
        ))
      )}
    </div>
  );
}