import api from "../api.jsx";

const suggestConstellation = async (starIds) => {
  const response = await api.post("/constellation/suggest", {
    starIds,
  });
  return response.data;
};

export default suggestConstellation;
