import axios from "axios";

/**권한 필요 axios 객체(Access Token 포함) */
const authApi = (accessToken) => 
    axios.create({
        baseURL: "http://13.209.42.66:8080/api/v1/", 
         headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
    },
    withCredentials: true,
    })
export default authApi;
