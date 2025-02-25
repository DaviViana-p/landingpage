import React from "react";
import styles from "./sobrenos.module.scss";

const SobreNos = () => {
  return (
    <section className={styles.sobreNos}>
      <div className={styles.container}>
        <h2>Sobre Nós</h2>
        <p>
          Somos uma equipe dedicada a fornecer as melhores soluções para nossos
          clientes. Nosso objetivo é entregar qualidade e inovação em todos os
          projetos.
        </p>
      </div>
      <div className={styles.container}>
        <h2>MISSÃO</h2>
        <p>
            impactar a sociedade com serviços de topografia e regularização fundiária
        </p>
      </div>
      <div className={styles.container}>
        <h2>VALORES</h2>
        <p>
            Empatia
            Inovação
            Resiliência
            Encantar o Cliente
        </p>
      </div>
      <div className={styles.container}>
        <h2>VISÃO</h2>
        <p>
            Ser a empresa de topografia e consultoria mais inovadora do Brasil
        </p>
      </div>
      
    </section>
  );
};

export default SobreNos;
