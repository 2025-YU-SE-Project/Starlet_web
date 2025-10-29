import { useEffect, useState } from "react";
import api from "../apis/api";

export function useConstellationDetail(id, open) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !id) return;
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await api.get(`constellation/archive/${id}`);
        if (alive) setData(res.data);
      } catch (e) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, open]);

  return { data, loading, error };
}
