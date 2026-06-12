"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { useParams } from "next/navigation";

export default function CustomerMenu() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    const q = query(
      collection(db, "menu"),
      where("restaurantId", "==", restaurantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMenu(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      
      <h1 className="text-3xl font-bold mb-6 text-center">
        🍽️ Menu
      </h1>

      {loading && (
        <p className="text-center text-gray-400">
          Loading menu...
        </p>
      )}

      {!loading && menu.length === 0 && (
        <p className="text-center text-gray-400">
          No items available
        </p>
      )}

      <div className="grid gap-4">
        {menu.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 p-4 rounded-xl shadow-md flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">
                {item.name}
              </h2>
              <p className="text-gray-400">
                ₹{item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}