"use client";

export default function ManagerDashboard() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("manager") || "{}")
      : {};

  return (
    <div style={{ padding: 40 }}>
      <h1>🍽️ Manager Dashboard</h1>

      <p><b>Email:</b> {user?.email}</p>
      <p><b>Restaurant ID:</b> {user?.restaurantId}</p>

      <hr />

      <h2>🚀 Coming Next:</h2>
      <ul>
        <li>Add Menu Items</li>
        <li>Edit Menu</li>
        <li>Delete Items</li>
      </ul>
    </div>
  );
}