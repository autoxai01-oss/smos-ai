"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function MenuPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        // 🔥 1. Try DIRECT DOC ID
        const docRef = doc(db, "restaurants", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRestaurant(docSnap.data());
          return;
        }

        // 🔥 2. Try SLUG SEARCH
        const snapshot = await getDocs(collection(db, "restaurants"));

        let found: any = null;

        snapshot.forEach((d) => {
          const data = d.data();
          if (data.slug === id || data.restaurantId === id) {
            found = data;
          }
        });

        if (found) {
          setRestaurant(found);
        } else {
          setError("Restaurant not found");
        }
      } catch (err) {
        console.log(err);
        setError("Error loading restaurant");
      }
    };

    loadRestaurant();
  }, [id]);

  const handlePin = () => {
    if (!restaurant) {
      setError("Restaurant not loaded");
      return;
    }

    if (pin === restaurant.pin) {
      setAllowed(true);
      setError("");
    } else {
      setError("Wrong PIN");
    }
  };

  if (!allowed) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Enter Table PIN</h2>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="1234"
            style={styles.input}
          />
          <button onClick={handlePin} style={styles.button}>
            Enter
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>{restaurant?.name}</h1>
      <p>Menu coming here...</p>
    </div>
  );
}

const styles: any = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b1220",
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
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "green",
    color: "white",
    border: "none",
  },
};