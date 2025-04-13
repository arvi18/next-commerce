import nc from "next-connect";
import Product from "../../../models/Product";
import db from "../../../utils/db";

const handler = nc();

handler.get(async (req, res) => {
  try {
    await db.connect();
    const product = await Product.findById(req.query.id);
    await db.disconnect();
    res.send(product);
  } catch (err) {
    console.error("❌ [ERROR] Product Retrieval - Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    await db.disconnect();
    console.warn("⚠️ [WARN] Product Retrieval - Sending error response to client");
    res.status(500).send({ message: err.message });
  }
});

export default handler;
