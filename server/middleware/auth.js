// server/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// JWT Secret 검증 (환경 변수 필수)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET 환경 변수가 설정되지 않았습니다.");
}

// JWT 토큰 검증 미들웨어
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "인증 토큰이 누락되었습니다." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT 검증 실패:", err.message);
            return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
        }

        req.user = user;
        next();
    });
};
