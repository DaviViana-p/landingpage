import Image from "next/image";
import Styles from "./features.module.scss";
import Icon from "/public/images/featuresicon1.png";
import Icon1 from "/public/images/featuresicon2.jpg";
import Icon2 from "/public/images/featuresicon3.jpeg";
import { ScrollTo } from "../../utils/scrollTo";
import Button from "../button";

const Features = () => {
  return (
    <div className={Styles.container}>
      <h1 className={Styles.title}>Serviços de Topografia,<br/> Georreferenciamento e Avaliação de Imóveis Urbanos e Rurais</h1>
      <div className={Styles.features}>
        <div className={Styles.feature}>
          <Image src={Icon} alt="Icon" className={Styles.icon} />
          <h1>Topografia e GerorreferenciamentoO</h1>
          <p>
					- Levantamentos topográficos planimétricos e planialtimétricos;
- Levantamentos topográficos cadastrais urbanos e rurais;
- Georreferenciamento de imóveis urbanos e rurais;
- Demarcação de terrenos;
- Medição, divisão e demarcação de sítios e fazendas;
- Levantamentos destinados a usucapião;
- Demarcação dos limites dos Terrenos de Marinha;
- Nivelamentos de precisão;
- Locação de obras e estruturas;
- Loteamentos: projetos e locação;
- Estradas: projetos e locação.				</p>
          <Button title="Fale conosco" onClick={() => ScrollTo("contato")} />        </div>
        <div className={Styles.feature}>
          <Image src={Icon2} alt="Icon" className={Styles.icon} />
          <h1>PLANER ALTMETRICO</h1>
          <p>- Terraplanagem; <br/> - Pavimentação;<br/>-Sistemas de Abastecimento de água;<br/> - Sistemas de  Saneamento;
          <br/> - Irrigação;<br/> - PDrenagem;<br/> - Usucapião e REURB;</p>
          <Button title="Fale conosco" onClick={() => ScrollTo("contato")} />
        </div>
        <div className={Styles.feature}>
          <Image src={Icon1} alt="Icon" className={Styles.icon} />
          <h1>Avaliação de Imóveis Urbanos e Rurais</h1>
          <p>Oferecemos uma análise completa e precisa para imóveis urbanos e rurais, com base em critérios técnicos e de mercado que garantem a valorização justa do seu patrimônio. Seja para compra, venda, financiamento ou questões judiciais, nossa avaliação detalhada assegura uma tomada de decisão segura e embasada.</p>
          <Button title="Fale conosco" onClick={() => ScrollTo("contato")} />
        </div>
        
      </div>
    </div>
  );
};

export default Features;
