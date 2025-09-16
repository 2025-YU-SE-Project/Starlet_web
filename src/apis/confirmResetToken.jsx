import api from "./api"                                                                                                                                                        

const confirmResetToken = async (token) => {
    const res = await api.get("verify/password-reset/confirm",{
        params: {token},
        headers: { Accept: "*/*"},
    })
    return res.data
}

export default confirmResetToken