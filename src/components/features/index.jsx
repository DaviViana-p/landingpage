import Image from "next/image";
import Styles from "./features.module.scss";
import Icon from "/public/images/icon.svg";

const Features = () => {
  return (
    <div className={Styles.container}>
      <h1>NOSSOS SERVIÇOS.</h1>

      <div className={Styles.features}>
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>GEORREFERENCIAMENTO DE IMÓVEIS RURAIS (INCRA)</h1>
          
        </div>
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>DREGULARIZAÇÃO DE IMÓVEIS RURAIS
          CCIR, ITR, NIRF, ADA E CAR</h1>
          
        </div>
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>GEOPROCESSAMENTO</h1>
          
        </div>
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>USUCAPIÃO</h1>
          
        </div>
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>LEVANTAMENTO TOPOGRÁFICO</h1>
          
        </div> 
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>PROJETO DE TERRAPLENAGEM</h1>
          
        </div>        
      </div>
    </div>
  );
};

export default Features;
