import db from './db';

const getError = (err) =>
  err.response && err.response.data && err.response.data.message
    ? err.response.data.message
    : err.message;

const onError = async (err, req, res, next) => {
  try { 
    await db.disconnect();
    res.status(500).send({ message: err.toString() });
  } catch (err) {
    console.error("❌ [ERROR] onError - Error occurred:", err);
    console.error("❌ [ERROR] onError - Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    res.status(500).send({ message: err.toString() });
  }
};
export { getError, onError };