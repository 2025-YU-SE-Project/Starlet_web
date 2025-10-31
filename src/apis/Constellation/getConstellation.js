// src/apis/Constellation/getConstellation.js
import api from "../api.jsx";

/**
 * 백엔드가 year, month를 요구하는 케이스에 맞춘 버전
 * @param {number} year  - 2025
 * @param {number} month - 1~12
 */
export default async function getConstellation(year, month) {
  // 백엔드가 0월/13월을 안 받으면 여기서 한 번 방어
  const m = Math.min(12, Math.max(1, month));
  const { data } = await api.get("constellation", {
    params: {
      year,
      month: m,
    },
  });
  return data;
}
