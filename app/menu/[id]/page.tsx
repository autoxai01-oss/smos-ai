"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function MenuPage({ params }: any) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pin, setPin] = useState("");
  const [access, setAccess] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    const fetchData = async () => {
      try {
        console.log("DOC ID:", params.id);

        // ✅ GET RESTAURANT BY DOC ID (MOST RELIABLE)
        const ref = doc(db, "restaurants", params.id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Restaurant not found ❌");
          return;
        }

        const data = snap.data();
        console.log("FOUND:", data);

        setRestaurant({ id: snap.id, ...data });

        // ✅ FETCH MENU ITEMS
        const menuSnap = await getDocs(collection(db, "menu"));
        const menuItems: any[] = [];

        menuSnap.forEach((doc) => {
          const item = doc.data();

          if (item.restaurantId === data.restaurantId) {
            menuItems.push({ id: doc.id, ...item });
          }
        });

        setItems(menuItems);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [params?.id]);

  // 🔐 PIN CHECK
  const handlePinSubmit = () => {
    if (!restaurant) {
      alert("Restaurant not loaded ❌");
      return;
    }

    if (pin.trim() === String(restaurant.pin).trim()) {
      setAccess(true);
    } else {
      alert("Wrong PIN ❌");
    }
  };

  // 🔒 PIN SCREEN
  if (!access) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Enter Table PIN</h2>

          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            style={styles.input}
          />

          <button onClick={handlePinSubmit} style={styles.button}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  // 🍽 MENU
  return (
    <div style={styles.container}>
      <h1>{restaurant.name}</h1>

      {items.length === 0 ? (
        <p>No items</p>
      ) : (
        items.map((item) => (
          <div key={item.id} style={styles.item}>
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
          </div>
        ))
      )}
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0b1a2b",
    color: "white",
    padding: "20px",
  },
  card: {
    maxWidth: "300px",
    margin: "120px auto",
    padding: "20px",
    background: "#1e2a38",
    borderRadius: "10px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "5px",
    border: "none",
  },
  button: {
    marginTop: "15px",
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "5px",
    color: "white",
  },
  item: {
    background: "#1e2a38",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
  },
};