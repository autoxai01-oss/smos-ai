"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function CustomerMenu() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const q = query(
        collection(db, "menu"),
        where("restaurantId", "==", restaurantId)
      );

      const snap = await getDocs(q);

      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMenu(items);
    };

    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl mb-6">Menu</h1>

      {menu.length === 0 && <p>No items available</p>}

      {menu.map((item) => (
        <div key={item.id} className="bg-gray-900 p-4 mb-3 rounded">
          <h2 className="text-lg">{item.name}</h2>
          <p>₹{item.price}</p>
        </div>
      ))}
    </div>
  );
}