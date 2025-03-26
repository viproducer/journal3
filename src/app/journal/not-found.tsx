export default function JournalNotFound() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px", textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Journal Entry Not Found</h1>
      <p style={{ marginBottom: "16px", color: "#6b7280" }}>
        The journal entry you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/journal"
        style={{
          display: "inline-block",
          padding: "8px 16px",
          backgroundColor: "#3b82f6",
          borderRadius: "4px",
          textDecoration: "none",
          color: "#ffffff",
        }}
      >
        Back to Journal
      </a>
    </div>
  )
}

