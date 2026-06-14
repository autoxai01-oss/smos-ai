"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import { useParams } from "next/navigation";

// ✅ TYPES
type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price?: number;
};

type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: string;
  isActive: boolean;
};

export default function Kitchen() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [orders, setOrders] = useState<Order[]>([]);

  // 🔥 REAL-TIME LISTENER
  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));
      setOrders(data);
    });

    return () => unsub();
  }, [restaurantId]);

  // 🔄 UPDATE STATUS
  const updateStatus = async (id: string, status: string) => {
    await updateDoc(
      doc(db, "restaurants", restaurantId, "orders", id),
      {
        status,
      }
    );
  };

  // 🔥 CLOSE ORDER (VERY IMPORTANT)
  const closeOrder = async (id: string) => {
    await updateDoc(
      doc(db, "restaurants", restaurantId, "orders", id),
      {
        status: "served",
        isActive: false, // 🔥 THIS CLOSES THE ORDER
      }
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">👨‍🍳 Kitchen Dashboard</h1>

      {orders.length === 0 && (
        <p className="text-center text-gray-400">No orders yet</p>
      )}

      <div className="grid md:grid-cols-3 gap-4">

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-800 p-4 rounded"
          >
            <h2 className="text-xl mb-2">
              Table: {order.tableId}
            </h2>

            <p className="mb-2">
              Status: <span className="font-bold">{order.status}</span>
            </p>

            <div className="mb-3">
              {order.items.map((item, index) => (
                <p key={index}>
                  {item.name} x {item.qty}
                </p>
              ))}
            </div>

            {/* 🔥 ACTION BUTTONS */}
            <div className="flex gap-2">

              <button
                onClick={() => updateStatus(order.id, "preparing")}
                className="bg-blue-500 px-3 py-1 rounded"
              >
                Start
              </button>

              <button
                onClick={() => closeOrder(order.id)}
                className="bg-green-500 px-3 py-1 rounded"
              >
                Done
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}