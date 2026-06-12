"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MenuPage({ params }: any) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH RESTAURANT
  useEffect(() => {
    const fetchRestaurant = async () => {
      const snapshot = await getDocs(collection(db, "restaurants"));

      let found: any = null;

      snapshot.forEach((doc) => {
        const data = doc.data();

        console.log("Checking:", data); // DEBUG

        if (data.restaurantId === params.id) {
          found = data;
        }
      });

      console.log("FOUND:", found); // DEBUG

      if (!found) {
        alert("Restaurant not found ❌");
      } else {
        setRestaurant(found);
      }

      setLoading(false);
    };

    fetchRestaurant();
  }, [params.id]);

  // 🔐 PIN CHECK
  const handlePinSubmit = () => {
    if (!restaurant) return;

    if (pin === restaurant.pin) {
      setAccess(true);
    } else {
      alert("Wrong PIN ❌");
    }
  };

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // 🔐 PIN SCREEN
  if (!access) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>Enter Table PIN</h2>

          <input
            type="text"
            placeholder="Enter PIN"
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

  // 🍽 MENU UI (after PIN)
  return (
    <div style={styles.container}>
      <h1>{restaurant?.name} Menu</h1>

      <p>Welcome! Menu will be shown here 👇</p>

      {/* NEXT STEP: fetch items from "menu" collection */}
    </div>
  );
}

const styles: any = {
  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    marginTop: "10px",
    width: "200px",
    borderRadius: "5px",
    border: "none",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  container: {
    padding: "30px",
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
  },
};