import Link from "next/link";
import Image from "next/image";
import Styles from "./footer.module.scss";
import Logo from "/public/images/logo.svg";
import IconInstagram from "/public/images/icon-instagram.svg";
import IconFacebook from "/public/images/icon-facebook.svg";
import IconLinkedin from "/public/images/icon-linkedin.svg";
import IconYoutube from "/public/images/icon-youtube.svg";

const Footer = () => {
  return (
    <div className={Styles.container}>
      <div className={`${Styles.column} ${Styles.columnPrincipal}`}>
        <Image src={Logo} alt="Logo" />
        <h1 className={Styles.title}>+55 22 98825-2862</h1>
        <p>rodrigo@rvstopografia.com</p>
      </div>
      <div className={`${Styles.column} ${Styles.alignRight}`}>
        <h1>SOCIAL</h1>
        <div className={Styles.icons}>
          <Link href="https://www.instagram.com/rodrigo_viana_agrimensor/">
            <Image src={IconInstagram} alt="Icon" className={Styles.icon} />
          </Link>
          <Link href="/">
            <Image src={IconFacebook} alt="Icon" className={Styles.icon} />
          </Link>
          <Link href="/">
            <Image src={IconLinkedin} alt="Icon" className={Styles.icon} />
          </Link>
          <Link href="/">
            <Image src={IconYoutube} alt="Icon" className={Styles.icon} />
          </Link>
        </div>
      </div>
      <div className={Styles.allRightReserved}>
        ©2025 RVS - Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Footer;
