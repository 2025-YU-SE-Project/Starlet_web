import axios from "axios"

const api = axios.create({
    baseURL: "http://3.37.130.125:8080/api/v1/", 
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export default api;