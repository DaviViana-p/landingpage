import Styles from "./welcome.module.scss";
import Button from "../button/index";
import BannerWelcome from "/public/images/bannerWelcome.svg";
import Image from "next/image";
import { ScrollTo } from "../../utils/scrollTo";

const Welcome = () => {
  return (
    <div className={Styles.container}>
      <div className={Styles.text}>
      <p>
          Bem Vindo 
        </p>
        <h1>RVS TOPOGRAFIA E CONSULTORIA</h1>
        <Button
          title="Aumentar vendas"
          kind="secundary"
          onClick={() => ScrollTo("contato")}
        />
      </div>

    </div>
  );
};

export default Welcome;
