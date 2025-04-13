import nc from "next-connect";
import Product from "../../../models/Product";
import db from "../../../utils/db";

const handler = nc();

handler.get(async (req, res) => {
  try {
    console.info('🔵 [INFO] Products - Starting to fetch products');
    await db.connect();
    console.info('🔵 [INFO] Products - Database connected successfully');
    
    const products = await Product.find({});
    console.info(`✅ [SUCCESS] Products - Retrieved ${products.length} products`);
    
    await db.disconnect();
    console.info('🔵 [INFO] Products - Database disconnected');
    
    res.send(products);
  } catch (err) {
    console.error('❌ [ERROR] Products - Error fetching products:', err);
    console.error('❌ [ERROR] Products - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    await db.disconnect();
    console.warn('⚠️ [WARN] Products - Sending error response to client');
    res.status(500).send({ message: err.message });
  }
});

export default handler;