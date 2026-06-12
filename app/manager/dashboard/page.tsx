"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<any[]>([]);

  // 🔥 YOUR RESTAURANT ID
  const restaurantId = "Fx59BXJH0zMJnqVSKZdS";

  // ✅ LIVE FETCH (CORRECT PATH)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "restaurants", restaurantId, "items"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(data);
      }
    );

    return () => unsub();
  }, [restaurantId]);

  // ✅ ADD ITEM (CORRECT COLLECTION)
  const addItem = async () => {
    if (!name || !price) {
      alert("Enter item & price");
      return;
    }

    try {
      await addDoc(
        collection(db, "restaurants", restaurantId, "items"),
        {
          name: name,
          price: Number(price),
          createdAt: new Date(),
        }
      );

      setName("");
      setPrice("");
    } catch (err) {
      console.error(err);
      alert("Error adding item");
    }
  };

  // ✅ DELETE ITEM
  const deleteItem = async (id: string) => {
    await deleteDoc(
      doc(db, "restaurants", restaurantId, "items", id)
    );
  };

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1>Manager Dashboard</h1>

      <h3>Add Item</h3>

      <input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br />

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <br />

      <button onClick={addItem}>Add Item</button>

      <h3>Menu Items</h3>

      {items.map((item) => (
        <div key={item.id}>
          {item.name} - ₹{item.price}
          <button onClick={() => deleteItem(item.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}