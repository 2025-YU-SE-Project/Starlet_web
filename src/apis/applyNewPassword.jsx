import api from "./api"

const applyNewPassword = async( {token, newPassword }) => {
    const res = await api.post( "verify/password-reset/new-password",
        {token, newPassword},
        {headers: { Accept: "*/*"}}
    )
    return res.data
}

export default applyNewPassword