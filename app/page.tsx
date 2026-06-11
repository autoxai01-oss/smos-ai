export default function Home() {
  return (
    <div style={{
      height: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1>🚀 SMOS AI</h1>
      <p>Smart Menu Ordering System</p>

      <a href="/admin" style={{
        marginTop: 20,
        padding: "12px 24px",
        background: "#22c55e",
        borderRadius: 8,
        textDecoration: "none",
        color: "black",
        fontWeight: "bold"
      }}>
        Admin Login 🔐
      </a>
    </div>
  );
}