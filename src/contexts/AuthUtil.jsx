
export const loadTokenFromStorage = () => {
  try {
    return sessionStorage.getItem("accessToken");
  } catch (err) {
    console.error("세션 스토리지에서 토큰을 읽는 중 오류: ", err);
  }
};

export const saveTokenToStorage = (token) => {
  sessionStorage.setItem("accessToken", token);
};


export const clearStorage = () => {
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("email");
  localStorage.removeItem("email");
  sessionStorage.removeItem("nickname");
  localStorage.removeItem("nickname");
};


