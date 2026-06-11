export default function Home() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      color: "white",
      flexDirection: "column"
    }}>
      <h1>🚀 SMOS AI</h1>
      <p>System is Live ✅</p>

      <a
        href="/admin"
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#22c55e",
          borderRadius: 8,
          textDecoration: "none",
          color: "black",
          fontWeight: "bold"
        }}
      >
        Go to Admin Panel
      </a>
    </div>
  );
}