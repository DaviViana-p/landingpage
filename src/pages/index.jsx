import Contato from "../components/contato";
import Features from "../components/features";
import Footer from "../components/footer";
import Header from "../components/header";
import Map from "../components/map";
import Welcome from "../components/welcome";
import styles from "./Home.module.scss";

export default function Home() {
  return (
    <div className={styles.container}>
      <Header />
      <Welcome />
     <Features />
      <Contato />
      <Map />
      <Footer />
    </div>
  );
}
