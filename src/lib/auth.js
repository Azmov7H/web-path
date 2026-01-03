import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET

export function verifytoken(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET);

  return decoded; // { userId, email, iat, exp }
}
