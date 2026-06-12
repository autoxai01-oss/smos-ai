"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

export default function MenuPage({ params }: any) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pin, setPin] = useState("");
  const [access, setAccess] = useState(false);

  // 🔥 LOAD RESTAURANT
  useEffect(() => {
    const fetchRestaurant = async () => {
      const ref = doc(db, "restaurants", params.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setRestaurant(snap.data());
      } else {
        alert("Restaurant not found");
      }
    };

    fetchRestaurant();
  }, []);

  // 🔐 PIN CHECK
  const checkPin = () => {
    if (!restaurant) return;

    if (pin === restaurant.pin) {
      setAccess(true);
    } else {
      alert("Wrong PIN");
    }
  };

  // 📦 LOAD MENU REAL-TIME
  useEffect(() => {
    if (!access) return;

    const unsubscribe = onSnapshot(
      collection(db, "restaurants", params.id, "menu"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      }
    );

    return () => unsubscribe();
  }, [access]);

  // 🔐 PIN SCREEN
  if (!access) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h3>Enter Table PIN</h3>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="4-digit PIN"
          />
          <br />
          <button onClick={checkPin}>Enter</button>
        </div>
      </div>
    );
  }

  // 🍽️ MENU SCREEN
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>{restaurant?.name} Menu</h2>

      {items.length === 0 && <p>No items yet</p>}

      {items.map((item) => (
        <div key={item.id} style={styles.item}>
          <h3>{item.name}</h3>
          <p>₹{item.price}</p>
          <p>🔥 {item.calories} kcal</p>
          <p>💪 {item.protein}g protein</p>
        </div>
      ))}
    </div>
  );
}

const styles: any = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  card: {
    background: "#111",
    padding: 20,
    borderRadius: 10,
  },
  item: {
    border: "1px solid gray",
    padding: 10,
    marginBottom: 10,
  },
};