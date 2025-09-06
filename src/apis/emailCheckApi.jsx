import api from "./api"

const emailCheckApi = async (email) => {
    const response = await api.get(`user/signup/email_available?email=${email}`)
    return response.data
}

export default emailCheckApi