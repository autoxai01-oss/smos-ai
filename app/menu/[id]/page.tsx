"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";

export default function MenuPage({ params }: any) {
  const restaurantId = params.id;

  const [pin, setPin] = useState("");
  const [correctPin, setCorrectPin] = useState("");
  const [verified, setVerified] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  // 🔐 GET PIN FROM FIREBASE
  useEffect(() => {
    const fetchRestaurant = async () => {
      const snapshot = await getDocs(collection(db, "restaurants"));

      snapshot.forEach((doc) => {
        const data = doc.data();

        if (data.restaurantId === restaurantId) {
          setCorrectPin(data.pin);
        }
      });
    };

    fetchRestaurant();
  }, []);

  // 🍽️ FETCH MENU
  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, "menu"));

    let list: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.restaurantId === restaurantId) {
        list.push({ id: doc.id, ...data });
      }
    });

    setItems(list);
  };

  // 🔐 VERIFY PIN
  const verifyPin = () => {
    if (pin === correctPin) {
      setVerified(true);
      fetchMenu();
    } else {
      alert("Wrong PIN");
    }
  };

  // 🛒 ADD TO CART
  const addToCart = (item: any) => {
    setCart([...cart, item]);
  };

  return (
    <div style={styles.container}>
      {!verified ? (
        // 🔐 PIN SCREEN
        <div style={styles.card}>
          <h2>Enter Table PIN</h2>

          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="4-digit PIN"
            style={styles.input}
          />

          <button onClick={verifyPin} style={styles.button}>
            Enter
          </button>
        </div>
      ) : (
        // 🍽️ MENU SCREEN
        <div>
          <h2>Menu</h2>

          {items.map((item) => (
            <div key={item.id} style={styles.item}>
              <div>
                <h3>{item.name}</h3>
                <p>₹ {item.price}</p>
              </div>

              <button
                onClick={() => addToCart(item)}
                style={styles.button}
              >
                Add
              </button>
            </div>
          ))}

          <h3 style={{ marginTop: "20px" }}>🛒 Cart</h3>

          {cart.map((c, i) => (
            <div key={i}>
              {c.name} - ₹{c.price}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "300px",
    margin: "100px auto",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    width: "100%",
    marginTop: "10px",
    borderRadius: "6px",
    border: "none",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#22c55e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  item: {
    background: "#334155",
    padding: "15px",
    marginTop: "10px",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
  },
};