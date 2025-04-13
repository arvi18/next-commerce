import nc from 'next-connect';
import Order from '../../../models/Order';
import { isAuth } from '../../../utils/auth';
import db from '../../../utils/db';
import { onError } from '../../../utils/error';

const handler = nc({
  onError,
});
handler.use(isAuth);

handler.post(async (req, res) => {
  try {
    console.info('🔵 [INFO] Order Creation - Starting order creation process');
    console.info('🔵 [INFO] Order Creation - Request body:', JSON.stringify(req.body, null, 2));
    console.info('🔵 [INFO] Order Creation - User info:', JSON.stringify(req.user, null, 2));
    
    await db.connect();
    console.info('🔵 [INFO] Order Creation - Database connected successfully');
    
    const newOrder = new Order({
      ...req.body,
      user: req.user._id,
    });
    
    console.info('🔵 [INFO] Order Creation - Creating new order:', JSON.stringify(newOrder, null, 2));
    const order = await newOrder.save();
    console.info('✅ [SUCCESS] Order Creation - Order created successfully:', JSON.stringify(order, null, 2));
    
    await db.disconnect();
    console.info('🔵 [INFO] Order Creation - Database disconnected');
    
    res.status(201).send(order);
  } catch (err) {
    console.error('❌ [ERROR] Order Creation - Error occurred:', err);
    console.error('❌ [ERROR] Order Creation - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    await db.disconnect();
    console.warn('⚠️ [WARN] Order Creation - Sending error response to client');
    res.status(500).send({ message: err.message });
  }
});

export default handler;