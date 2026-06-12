"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // 🔥 IMPORTANT: SAME restaurantId everywhere
  const restaurantId = "Fx59BXJH0zMJnqVSKZdS";

  // LOAD ITEMS
  const loadItems = async () => {
    const snap = await getDocs(
      collection(db, "restaurants", restaurantId, "items")
    );

    setItems(
      snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ADD ITEM
  const addItem = async () => {
    if (!name || !price) return;

    await addDoc(
      collection(db, "restaurants", restaurantId, "items"),
      {
        name,
        price,
      }
    );

    setName("");
    setPrice("");
    loadItems();
  };

  // DELETE ITEM
  const deleteItem = async (id) => {
    await deleteDoc(
      doc(db, "restaurants", restaurantId, "items", id)
    );
    loadItems();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Manager Dashboard</h1>

      <h3>Add Item</h3>
      <input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button onClick={addItem}>Add</button>

      <h3>Menu Items</h3>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} - ₹{item.price}
          <button onClick={() => deleteItem(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}