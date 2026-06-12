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
  const [loading, setLoading] = useState(true);

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

      setLoading(false);
    };

    fetchRestaurant();
  }, []);

  // 🔐 CHECK PIN
  const checkPin = () => {
    if (!restaurant) {
      alert("Restaurant not loaded yet");
      return;
    }

    console.log("Entered PIN:", pin);
    console.log("Actual PIN:", restaurant.pin);

    if (String(pin) === String(restaurant.pin)) {
      setAccess(true);
    } else {
      alert("Wrong PIN ❌");
    }
  };

  // 🔴 REAL-TIME MENU
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

  // ⏳ LOADING STATE
  if (loading) {
    return <div style={styles.center}>Loading...</div>;
  }

  // 🔐 PIN SCREEN
  if (!access) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h3>Enter Table PIN</h3>

          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            style={styles.input}
          />

          <button onClick={checkPin} style={styles.button}>
            Enter
          </button>
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
          <p>🔥 {item.calories || 0} kcal</p>
          <p>💪 {item.protein || 0}g protein</p>
        </div>
      ))}
    </div>
  );
}

// 🎨 STYLES
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
    textAlign: "center",
  },
  input: {
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  button: {
    padding: 10,
    background: "green",
    color: "white",
    border: "none",
  },
  item: {
    border: "1px solid gray",
    padding: 10,
    marginBottom: 10,
  },
};