/**세션 스토리지에서 저장된 Access Token을 가져오기 위한 함수 */
export const loadTokenFromStorage = () => {
  try {
    return sessionStorage.getItem("accessToken");
  } catch (err) {
    console.error("세션 스토리지에서 토큰을 읽는 중 오류: ", err);
  }
};

/**Access Token을 세션 스토리지에 저장 */
export const saveTokenToStorage = (token) => {
  sessionStorage.setItem("accessToken", token);
};

/**세션 스토리지에 저장된 토큰 지우기 */
export const clearStorage = () => {
  sessionStorage.removeItem("accessToken");
};
