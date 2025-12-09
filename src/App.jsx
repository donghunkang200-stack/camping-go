import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CampingList from "./pages/CampingList";
import CampingDetail from "./pages/CampingDetail";
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_JS_KEY
    }&libraries=services&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        // map init
      });
    };
    document.head.appendChild(script);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<CampingList />} />
        <Route path="/detail/:id" element={<CampingDetail />} />
      </Routes>
    </Router>
  );
}
