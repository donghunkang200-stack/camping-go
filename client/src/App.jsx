import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { Layout } from "./components/Layout";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./components/ScrollToTop";
import CampingList from "./pages/CampingList";
import CampingDetail from "./pages/CampingDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// 로그인 필수 라우트 (비로그인 시 로그인 페이지로 이동)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// 로그인 시 접근 불가 라우트 (로그인 상태면 캠핑 목록으로 이동)
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/camping" replace /> : <>{children}</>;
};

// 라우트 구성
const AppRoutes = () => {
  return (
    <Routes>
      {/* 메인 홈 */}
      <Route path="/" element={<HomePage />} />

      {/* 캠핑장 목록 (로그인 필수) */}
      <Route
        path="/camping"
        element={
          <ProtectedRoute>
            <CampingList />
          </ProtectedRoute>
        }
      />

      {/* 캠핑장 상세 (공개) */}
      <Route
        path="/detail/:id"
        element={<CampingDetail />}
      />

      {/* 인증 페이지 */}
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <LoginPage />
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <RegisterPage />
          </AuthRedirect>
        }
      />

      {/* 정의되지 않은 경로는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// 메인 App 컴포넌트
const App = () => {
  // 카카오맵 SDK 동적 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&libraries=services&autoload=false`;

    script.onload = () => {
      try {
        if (
          window.kakao &&
          window.kakao.maps &&
          typeof window.kakao.maps.load === "function"
        ) {
          window.kakao.maps.load(() => {
            window.__kakao_ready = true;
            console.log("Kakao Map SDK Loaded");
          });
        } else {
          console.warn("Kakao script loaded but maps not ready yet");
        }
      } catch (err) {
        console.error("Error during Kakao maps.load():", err);
        window.__kakao_load_error = true;
      }
    };

    script.onerror = () => {
      console.error("Failed to load Kakao Maps SDK script");
      window.__kakao_load_error = true;
    };

    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(script);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <AppRoutes />
      </Layout>
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
    </Router>
  );
};

export default App;
