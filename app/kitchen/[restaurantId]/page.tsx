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

  useEffect(() => {
    const q = query(
      collection(db, "restaurants", restaurantId, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Order, "id">),
        }))
      );
    });

    return () => unsub();
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl text-center mb-6">
        👨‍🍳 Kitchen Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-4">

        {orders.map((order) => (
          <div key={order.id} className="bg-gray-800 p-4 rounded">

            <h2 className="font-bold mb-2">
              Table: {order.tableId}
            </h2>

            {order.items.map((item, i) => (
              <p key={i}>
                {item.name} x {item.qty}
              </p>
            ))}

          </div>
        ))}

      </div>

    </div>
  );
}