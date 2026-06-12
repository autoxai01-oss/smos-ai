"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MenuPage({ params }: any) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pin, setPin] = useState("");
  const [access, setAccess] = useState(false);

  useEffect(() => {
    if (!params?.id) return; // ✅ WAIT until ID exists

    const fetchData = async () => {
      try {
        console.log("PARAM ID:", params.id);

        const snapshot = await getDocs(collection(db, "restaurants"));

        let found: any = null;

        snapshot.forEach((doc) => {
          const data = doc.data();

          console.log("CHECKING:", data.restaurantId);

          if (String(data.restaurantId) === String(params.id)) {
            found = {
              id: doc.id,
              ...data,
            };
          }
        });

        if (!found) {
          alert("Restaurant NOT FOUND ❌");
          return;
        }

        console.log("FOUND:", found);

        setRestaurant(found);

        // ✅ FETCH MENU
        const menuSnap = await getDocs(collection(db, "menu"));
        const menuItems: any[] = [];

        menuSnap.forEach((doc) => {
          const data = doc.data();

          if (String(data.restaurantId) === String(found.restaurantId)) {
            menuItems.push({ id: doc.id, ...data });
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

    const entered = pin.trim();
    const actual = String(restaurant.pin).trim();

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

  // 🍽 MENU
  return (
    <div style={styles.container}>
      <h1>{restaurant?.name}</h1>

      {items.length === 0 ? (
        <p>No items</p>
      ) : (
        items.map((item) => (
          <div key={item.id} style={styles.item}>
            <div>
              <h3>{item.name}</h3>
              <p>₹{item.price}</p>
            </div>
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
    padding: "10px 20px",
    background: "#22c55e",
    border: "none",
    borderRadius: "5px",
    color: "white",
    cursor: "pointer",
  },
  item: {
    background: "#1e2a38",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
  },
};