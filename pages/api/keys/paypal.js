const handler = async (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID || "sb";
  try {
    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ clientId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default handler;
