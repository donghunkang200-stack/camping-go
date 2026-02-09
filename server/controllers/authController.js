// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// JWT Secret 검증 (환경 변수 필수)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("❌ JWT_SECRET 환경 변수가 설정되지 않았습니다.");
}

// 회원가입 처리
export const register = async (req, res) => {
    console.log("--- 회원가입 시도 ---");
    console.log("아이디:", req.body.username);
    try {
        const { name, username, email, password } = req.body;

        // 필수 입력값 검증
        if (!username || !password) {
            return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
        }

        // 이메일 형식 검증
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "유효하지 않은 이메일 형식입니다." });
            }
        }

        // 비밀번호 강도 검증
        if (password.length < 8) {
            return res.status(400).json({ message: "비밀번호는 최소 8자 이상이어야 합니다." });
        }

        // 아이디 중복 확인
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 생성 및 저장
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        console.log(`✅ 새 유저 가입: ${username}`);
        res.status(201).json({ message: `${name}님 회원 가입성공!` });
    } catch (error) {
        console.error("회원가입 에러:", error);
        res.status(500).json({ message: "서버 오류로 가입에 실패했습니다." });
    }
};

// 로그인 처리 및 JWT 토큰 발급
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 사용자 존재 여부 확인
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
        }

        // 비밀번호 검증
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 틀렸습니다." });
        }

        // JWT 토큰 생성 (유효기간 1일)
        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
            expiresIn: "1d",
        });

        console.log(`🔑 로그인 성공: ${username}`);
        res.json({ token });
    } catch (error) {
        console.error("로그인 에러:", error);
        res.status(500).json({ message: "서버 오류로 로그인에 실패했습니다." });
    }
};
