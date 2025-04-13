import jwt from "jsonwebtoken";
const JWT_SECRET_ = "JWT_SECRET_";

const signToken = (user) => {
  try {
    console.info('🔵 [INFO] Auth - Starting token signing process');
    console.info('🔵 [INFO] Auth - User data for token:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
    
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET || JWT_SECRET_,
      {
        expiresIn: "30d",
      }
    );
    
    console.info('✅ [SUCCESS] Auth - Token signed successfully');
    return token;
  } catch (err) {
    console.error('❌ [ERROR] Auth - Error signing token:', err);
    console.error('❌ [ERROR] Auth - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    throw err;
  }
};

const isAuth = async (req, res, next) => {
  try {
    console.info('🔵 [INFO] Auth - Starting authentication check');
    const { authorization } = req.headers;
    
    if (!authorization) {
      console.warn('⚠️ [WARN] Auth - No authorization token provided');
      return res.status(401).send({ message: "Token is not supplied" });
    }
    
    // Bearer xxx => xxx
    const token = authorization.slice(7, authorization.length);
    console.info('🔵 [INFO] Auth - Verifying token');
    
    jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET_, (err, decode) => {
      if (err) {
        console.error('❌ [ERROR] Auth - Token verification failed:', err);
        console.error('❌ [ERROR] Auth - Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        return res.status(401).send({ message: "Token is not valid" });
      }
      
      console.info('✅ [SUCCESS] Auth - Token verified successfully');
      req.user = decode;
      next();
    });
  } catch (err) {
    console.error('❌ [ERROR] Auth - Authentication process failed:', err);
    console.error('❌ [ERROR] Auth - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).send({ message: "Authentication process failed" });
  }
};

export { signToken, isAuth };
