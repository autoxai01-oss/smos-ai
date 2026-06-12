"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

export default function ManagerDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  // ✅ FIX: GET localStorage ONLY IN useEffect
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("manager") || "{}");

    if (!data?.restaurantId) {
      alert("Not logged in");
      return;
    }

    setRestaurantId(data.restaurantId);
  }, []);

  // 🔥 REAL-TIME LISTENER
  useEffect(() => {
    if (!restaurantId) return;

    const unsubscribe = onSnapshot(
      collection(db, "restaurants", restaurantId, "menu"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      }
    );

    return () => unsubscribe();
  }, [restaurantId]);

  // ➕ ADD ITEM
  const addItem = async () => {
    if (!restaurantId) return;

    await addDoc(
      collection(db, "restaurants", restaurantId, "menu"),
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
    if (!restaurantId) return;

    await deleteDoc(
      doc(db, "restaurants", restaurantId, "menu", id)
    );
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Manager Dashboard</h2>

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

      <hr />

      {items.map((item) => (
        <div key={item.id}>
          {item.name} - ₹{item.price}
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}