import api from "./api";

/**회원가입 API */
const signUpApi = async (body) => {
    const result = await api.post("user/signup", body)
    console.log(result.data)
}

export default signUpApi;
