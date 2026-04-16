import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
});
