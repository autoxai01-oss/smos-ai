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
  id: string;
  name: string;
  qty: number;
};

type Order = {
  id: string;
  tableId: string;
  items: OrderItem[];
  createdAt?: any;
};

export default function Kitchen() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [orders, setOrders] = useState<Order[]>([]);

  // 🔥 REALTIME FETCH
  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "asc")
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

  // 🔥 GROUP BY TABLE
  const grouped: Record<string, Order[]> = {};

  orders.forEach((order) => {
    if (!grouped[order.tableId]) {
      grouped[order.tableId] = [];
    }
    grouped[order.tableId].push(order);
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl mb-6 text-center">
        👨‍🍳 Kitchen Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        {Object.entries(grouped).map(([tableId, tableOrders]) => (
          <div key={tableId} className="bg-gray-800 p-4 rounded">

            <h2 className="text-xl mb-3">
              Table: {tableId}
            </h2>

            {/* 🔥 TRUE TIMELINE */}
            {tableOrders.map((order) => (
              <div
                key={order.id}
                className="mb-4 border-t border-gray-600 pt-2"
              >
                <p className="text-xs text-gray-400 mb-1">
                  New Order
                </p>

                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.name} x {item.qty}
                  </p>
                ))}
              </div>
            ))}

          </div>
        ))}

      </div>

    </div>
  );
}