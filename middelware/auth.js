const jwt = require("jsonwebtoken");
const {JWT_SEC_KEY} = require('../conf')
module.exports = function(req, res, next) {
  //get the token from the header if present
  const token = req.headers["auth"] || req.headers["authorization"];
  //if no token found, return response (without going to the next middelware)
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    //if can verify the token, set req.user and pass to next middleware
    const decoded = jwt.verify(token,JWT_SEC_KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    //if invalid token
    res.status(400).send("Invalid token.");
  }
};