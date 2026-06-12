"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MenuPage({ params }: any) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pin, setPin] = useState("");
  const [access, setAccess] = useState(false);

  // 🔥 FETCH RESTAURANT (100% WORKING METHOD)
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("URL PARAM:", params.id);

        // ✅ GET ALL RESTAURANTS
        const snapshot = await getDocs(collection(db, "restaurants"));

        let found: any = null;

        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log("CHECK:", data);

          if (data.restaurantId === params.id) {
            found = data;
          }
        });

        if (!found) {
          alert("Restaurant not found ❌");
          return;
        }

        console.log("FOUND RESTAURANT:", found);

        setRestaurant(found);

        // ✅ FETCH MENU ITEMS
        const menuSnap = await getDocs(collection(db, "menu"));
        const menuItems: any[] = [];

        menuSnap.forEach((doc) => {
          const data = doc.data();

          if (data.restaurantId === found.restaurantId) {
            menuItems.push({ id: doc.id, ...data });
          }
        });

        setItems(menuItems);
      } catch (err) {
        console.error(err);
        alert("Error loading data");
      }
    };

    fetchData();
  }, [params.id]);

  // 🔐 PIN CHECK
  const handlePinSubmit = () => {
    if (!restaurant?.pin) {
      alert("Restaurant not loaded ❌");
      return;
    }

    const entered = pin.toString().trim();
    const actual = restaurant.pin.toString().trim();

    console.log("ENTERED:", entered);
    console.log("ACTUAL:", actual);

    if (entered === actual) {
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
            type="number"
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />

          <button onClick={handlePinSubmit} style={styles.button}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  // 🍽 MENU SCREEN
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {restaurant?.name || "Menu"}
      </h1>

      {items.length === 0 ? (
        <p>No items available</p>
      ) : (
        items.map((item) => (
          <div key={item.id} style={styles.item}>
            <div>
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
            </div>

            <button style={styles.addBtn}>Add</button>
          </div>
        ))
      )}
    </div>
  );
}

// 🎨 STYLES
const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0b1a2b",
    color: "white",
    padding: "20px",
  },

  card: {
    maxWidth: "320px",
    margin: "120px auto",
    padding: "20px",
    background: "#1e2a38",
    borderRadius: "10px",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginTop: "15px",
    borderRadius: "6px",
    border: "none",
  },

  button: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1e2a38",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
  },

  addBtn: {
    background: "#22c55e",
    border: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
  },
};