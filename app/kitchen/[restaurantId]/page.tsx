"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { useParams } from "next/navigation";

type OrderItem = {
  name: string;
  qty: number;
  price?: number;
};

type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  createdAt?: any;
  status?: string;
};

export default function Kitchen() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"), // ✅ FIXED PATH
      orderBy("createdAt", "desc") // latest first
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

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">
        👨‍🍳 Kitchen Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow"
          >
            <h2 className="text-lg font-bold mb-2">
              Table: {order.tableId}
            </h2>

            <p className="text-xs text-green-400 mb-2">
              ● New Order
            </p>

            <div className="space-y-1">
              {order.items?.map((item, i) => (
                <p key={i}>
                  {item.name} x {item.qty}
                </p>
              ))}
            </div>

            {order.createdAt && (
              <p className="text-xs text-gray-500 mt-3">
                {new Date(order.createdAt.seconds * 1000).toLocaleTimeString()}
              </p>
            )}
          </div>
        ))}

      </div>

    </div>
  );
}