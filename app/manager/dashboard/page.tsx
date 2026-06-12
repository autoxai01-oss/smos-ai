"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ManagerDashboard() {
  const [restaurantId, setRestaurantId] = useState("");
  const [menu, setMenu] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        router.push("/login");
        return;
      }

      const data = snap.docs[0].data();

      if (data.role !== "manager") {
        router.push("/login");
        return;
      }

      setRestaurantId(data.restaurantId);
      fetchMenu(data.restaurantId);
    });

    return () => unsub();
  }, []);

  const fetchMenu = async (rid: string) => {
    const q = query(
      collection(db, "menu"),
      where("restaurantId", "==", rid)
    );

    const snap = await getDocs(q);

    const items = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setMenu(items);
  };

  const addItem = async () => {
    if (!name || !price) return;

    await addDoc(collection(db, "menu"), {
      name,
      price: Number(price),
      restaurantId
    });

    setName("");
    setPrice("");
    fetchMenu(restaurantId);
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
    fetchMenu(restaurantId);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-6">Manager Dashboard</h1>

      <div className="bg-gray-900 p-4 rounded mb-6">
        <h2 className="mb-3">Add Menu Item</h2>

        <input
          className="p-2 bg-gray-800 mr-2"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-2 bg-gray-800 mr-2"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={addItem}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="bg-gray-900 p-4 rounded">
        <h2 className="mb-3">Menu Items</h2>

        {menu.map((item) => (
          <div
            key={item.id}
            className="flex justify-between bg-gray-800 p-3 mb-2 rounded"
          >
            <div>
              {item.name} - ₹{item.price}
            </div>

            <button
              onClick={() => deleteItem(item.id)}
              className="bg-red-500 px-3 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}