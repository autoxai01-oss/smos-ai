"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function MenuPage({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pin, setPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD RESTAURANT
  useEffect(() => {
    if (!params?.id) return;

    const fetchRestaurant = async () => {
      try {
        console.log("Fetching:", params.id);

        const ref = doc(db, "restaurants", params.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          console.log("Restaurant found:", snap.data());
          setRestaurant(snap.data());
        } else {
          alert("Restaurant not found ❌");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading restaurant ❌");
      } finally {
        setLoading(false); // ✅ IMPORTANT FIX
      }
    };

    fetchRestaurant();
  }, [params.id]);

  // 🔥 LOAD MENU ITEMS
  useEffect(() => {
    if (!verified) return;

    const fetchItems = async () => {
      try {
        const snap = await getDocs(
          collection(db, "restaurants", params.id, "items")
        );

        const data: any[] = [];
        snap.forEach((doc) =>
          data.push({ id: doc.id, ...doc.data() })
        );

        setItems(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchItems();
  }, [verified, params.id]);

  // 🔐 PIN CHECK
  const handlePin = () => {
    if (!restaurant) {
      alert("Restaurant not loaded ❌");
      return;
    }

    if (pin === restaurant.pin) {
      setVerified(true);
    } else {
      alert("Wrong PIN ❌");
    }
  };

  // 🔄 LOADING SCREEN
  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // 🔐 PIN SCREEN
  if (!verified) {
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
          <button onClick={handlePin} style={styles.button}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  // 🍽 MENU SCREEN
  return (
    <div style={{ padding: 20 }}>
      <h1>{restaurant?.name} Menu</h1>

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        items.map((item) => (
          <div key={item.id} style={styles.item}>
            <h3>{item.name}</h3>
            <p>₹ {item.price}</p>
          </div>
        ))
      )}
    </div>
  );
}

// 🎨 SIMPLE STYLES
const styles: any = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#0b1a2b",
    color: "white",
  },
  card: {
    background: "#13263a",
    padding: 20,
    borderRadius: 10,
    textAlign: "center",
  },
  input: {
    padding: 10,
    marginTop: 10,
    width: "100%",
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    padding: 10,
    background: "green",
    color: "white",
    border: "none",
    borderRadius: 5,
  },
  item: {
    background: "#13263a",
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    color: "white",
  },
};