import { useEffect, useState } from "react";
import api from "../apis/api"; 

export function useConstellationArchive() {
  const [data, setData] = useState(null);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        
        const res = await api.get("constellation/archive");
        const list = Array.isArray(res.data) ? res.data : [];

   
        const details = await Promise.all(
          list.map(async (it) => {
            try {
              const d = await api.get(`constellation/archive/${it.constellationId}`);
              return { id: it.constellationId, connections: d.data?.connections || [] };
            } catch {
              return { id: it.constellationId, connections: [] };
            }
          })
        );

        const merged = list.map((it) => {
          const found = details.find((d) => d.id === it.constellationId);
          return { ...it, connections: found ? found.connections : [] };
        });

        if (mounted) setData(merged);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
