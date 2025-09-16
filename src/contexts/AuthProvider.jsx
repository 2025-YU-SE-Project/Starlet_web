import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import {
  clearStorage,
  loadTokenFromStorage,
  saveTokenToStorage,
} from "./AuthUtil";

/**React Context API를 이용한 전역 관리 컴포넌트 */
const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);

  /**세션 스토리지 내 저장된 Access Token이 있을 경우 불러오기 */
  useEffect(() => {
    const storedToken = loadTokenFromStorage();
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  /**로그인 시 세션 스토리지에 Access Token 저장 */
  const login = useCallback((token) => {
    setAccessToken(token);
    saveTokenToStorage(token);
  }, []);

  /**로그아웃 시 세션 스토리지 및 accessToken 초기화 */
  const logout = useCallback(() => {
    setAccessToken(null);
    clearStorage();
    window.location.href = "/";
  }, []);

  /**웹 전체에 전역으로 공급 */
  const value = useMemo(
    () => ({ accessToken, login, logout }),
    [accessToken, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
