import mongoose from "mongoose";

const connection = {};

async function connect() {
  try {
    console.info('🔵 [INFO] Database - Attempting to connect to database...');
    if (connection.isConnected) {
      console.info('🔵 [INFO] Database - Using existing database connection');
      return;
    }
    if (mongoose.connections.length > 0) {
      connection.isConnected = mongoose.connections[0].readyState;
      if (connection.isConnected === 1) {
        console.info('🔵 [INFO] Database - Using previous database connection');
        return;
      }
      console.warn('⚠️ [WARN] Database - Disconnecting from previous connection');
      await mongoose.disconnect();
    }
    const MONGO_URI =
      "mongodb+srv://next-commerce:next-commerce@next-commerce.8ofucp3.mongodb.net/?retryWrites=true&w=majority";
    console.info('🔵 [INFO] Database - Establishing new connection...');
    const db = await mongoose.connect(process.env.MONGODB_URI || MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.info('✅ [SUCCESS] Database - New connection established successfully');
    connection.isConnected = db.connections[0].readyState;
  } catch (err) {
    console.error('❌ [ERROR] Database - Connection error:', err);
    console.error('❌ [ERROR] Database - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    throw err;
  }
}

async function disconnect() {
  try {
    console.info('🔵 [INFO] Database - Attempting to disconnect...');
    if (connection.isConnected) {
      if (process.env.NODE_ENV === "production") {
        await mongoose.disconnect();
        connection.isConnected = false;
        console.info('✅ [SUCCESS] Database - Disconnected in production mode');
      }
    } else {
      console.info('🔵 [INFO] Database - No active connection to disconnect');
    }
  } catch (err) {
    console.error('❌ [ERROR] Database - Disconnection error:', err);
    console.error('❌ [ERROR] Database - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    throw err;
  }
}

// Error: Error serializing `.products[0]._id` returned from `getServerSideProps` in "/".
// Reason: `object` ("[object Object]") cannot be serialized as JSON. Please only return JSON serializable data types.
function convertDocToObj(doc) {
  try {
    doc._id = doc._id.toString();
    doc.createdAt = doc.createdAt.toString();
    doc.updatedAt = doc.updatedAt.toString();
    return doc;
  } catch (err) {
    console.error('❌ [ERROR] Database - Error converting document:', err);
    throw err;
  }
}

const db = { connect, disconnect, convertDocToObj };
export default db;
