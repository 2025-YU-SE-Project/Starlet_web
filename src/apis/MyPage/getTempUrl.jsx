import api from "../api";

async function getTempUrl(contentType) {
  try {
    const res = await api.post("s3/image/tempUrl", null, {
      params: { contentType },
    });

    return res.data;
  } catch (error) {
    console.error("요청 실패:", error);
    const status = error.response?.status;
    const message = error.response?.data?.message || "오류가 발생했습니다.";

    const err = new Error(message);
    err.status = status;
    throw err;
  }
}

export default getTempUrl;
