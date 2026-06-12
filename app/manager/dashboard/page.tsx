"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function ManagerDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  const restaurant = JSON.parse(localStorage.getItem("manager") || "{}");

  // 🔥 REAL-TIME LISTENER
  useEffect(() => {
    if (!restaurant?.restaurantId) return;

    const unsubscribe = onSnapshot(
      collection(db, "restaurants", restaurant.restaurantId, "menu"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // ➕ ADD ITEM
  const addItem = async () => {
    if (!name || !price) {
      alert("Enter name & price");
      return;
    }

    await addDoc(
      collection(db, "restaurants", restaurant.restaurantId, "menu"),
      {
        name,
        price: Number(price),
        calories: Number(calories || 0),
        protein: Number(protein || 0),
        createdAt: new Date(),
      }
    );

    setName("");
    setPrice("");
    setCalories("");
    setProtein("");
  };

  // ❌ DELETE ITEM
  const deleteItem = async (id: string) => {
    await deleteDoc(
      doc(db, "restaurants", restaurant.restaurantId, "menu", id)
    );
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Manager Dashboard</h2>

      {/* ADD FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
        <input
          placeholder="Protein"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
        />

        <button onClick={addItem}>Add Item</button>
      </div>

      {/* ITEMS LIST */}
      <div>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              marginBottom: 10,
              padding: 10,
              border: "1px solid gray",
            }}
          >
            <b>{item.name}</b> - ₹{item.price}  
            <br />
            🔥 {item.calories} kcal | 💪 {item.protein}g
            <br />
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}