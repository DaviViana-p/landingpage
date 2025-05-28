import { useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../components/mapViwer/mapViwer.module.scss";
import MapViewer from '../components/mapViwer';

export default function WebGisPage() {
  const router = useRouter();

  useEffect(() => {
    // Protege a rota: redireciona se não houver token
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div>
      <h1 className={styles.title}>RVS - WebGIS!</h1>
      <div className={styles.mapContainer}>
        <MapViewer />
      </div>
    </div>
  );
}