// src/api/campingApi.js
import api from "./api";

/**
 * 전체 캠핑장 목록 조회 (서버 캐싱된 데이터)
 * @returns {Promise<CampingResponse>}
 */
export const getAllCamping = () => {
  return api.get("/camping/all"); // { data: [...] } 형태 반환
};

/**
 * 키워드로 캠핑장 검색
 * @param {string} keyword - 검색어 (캠핑장명, 지역 등)
 * @returns {Promise<CampingResponse>}
 */
export const searchCamping = (keyword) => {
  return api.get("/camping/search", {
    params: { keyword },
  });
};

/**
 * 특정 캠핑장 상세 정보 조회
 * @param {string} id - 캠핑장 ID (contentId)
 * @returns {Promise<CampingData>}
 */
export const getCampingDetail = (id) => {
  return api.get(`/camping/detail/${id}`);
};

/**
 * 주변 캠핑장 조회
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 * @param {number} distance - 검색 반경(km)
 * @returns {Promise<CampingResponse>}
 */
export const getNearbyCamping = (lat, lng, distance = 10) => {
  return api.get("/camping/nearby", {
    params: { lat, lng, distance },
  });
};
