export const PORT = Number(process.env.PORT) || 5000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const BCRYPT_SALT_ROUNDS = 10;
