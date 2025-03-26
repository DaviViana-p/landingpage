import { useState } from "react";
import Icon from "/public/images/icon.svg";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Styles from "./contato.module.scss";
import Button from "../button/index";
import Input from "../input";
import Select from "../select";
import { Loading } from "../loading/index";
import { SuccessModal } from "../successModal";
import { FailModal } from "../failModal/index";
import Script from "next/script";


const Contato = () => {
  const [isloading, setLoading] = useState(false);
  const [successModal, setModalSuccess] = useState(false);
  const [failModal, setFailModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      website: "",
      local: "",
      servico: "",
      detalhes: "",
    },
    

    validationSchema: Yup.object({
      name: Yup.string().required("Campo Obrigatório"),
      email: Yup.string()
        .email("E-mail inválido")
        .required("Campo Obrigatório"),
      phone: Yup.string()
        .matches("", "Digite um telefone válido")
        .required("Campo Obrigatório"),
      website: Yup.string().required("Campo Obrigatório"),
      local: Yup.string().required("Campo Obrigatório"),
      servico: Yup.string().required("Campo Obrigatório"),
      detalhes: Yup.string().required("Campo Obrigatório"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => handleSubmitForm(values),
  });

  /*   formik?.errors -> Pode ser utilizado para dar feedback no campo e para o usuario*/

  const handleSubmitForm = (values) => {
    setLoading(true);
    let token = "";
    grecaptcha.ready(async () => {
      token = await grecaptcha.execute('6Lf0A_sqAAAAAPA6RSKU7_p13QQ3Hq88rb-olUeh', { action: 'submit' }).then(function(token) {
        
    axios
      .post("/api/sendEmail", {
        messageBody: `token: ${token},Nome: ${values.name}, Email: ${values.email}, Telefone: ${values.phone}, Site: ${values.website}, local: ${values.local}, servico: ${values.servico}, detalhes: ${values.detalhes}`,
      })
      .then(() => {
        formik.resetForm();
        setLoading(false);
        setModalSuccess(true);
      })
      .catch(() => {
        setLoading(false);
        setFailModal(true);
      });
    });
    });
  };

  const closeModal = () => {
    setFailModal(false);
    setModalSuccess(false);
  };

  return (
    <>
      {successModal && <SuccessModal closeModal={closeModal} />}
      {failModal && <FailModal closeModal={closeModal} />}
      {isloading && <Loading />}
      <div className={Styles.container} id="contato">
        <div className={Styles.texts}>
          <span>ENTRE EM CONTATO</span>
          <h1>Nossa forma de trabalhar</h1>
          
          <ul>
            <li>Contato: fale conosco para solicitar o seu projeto;</li>
            <li>Diagnóstico: ao conversar com você, vamos entender melhor o seu problema e apresentar uma proposta de solução personalizada;</li>
            <li>Desenvolvimento: nossos consultores trabalham para executar o projeto, sempre validando com você;</li>
            <li>Entrega da Solução: ao fim do projeto, fazemos as entregas acordadas e te orientamos em como prosseguir.</li>
          </ul>           
          

          <div className={Styles.feature}>
            <Image src={Icon} alt="Icon" className={Styles.icon} />
            <p>Se desejar faça seu pedido de orçamento pelo Whatsapp</p>
            <p>+55 22 98825-2862 / 22 26209246</p>
           </div> 
        </div>
        <div className={Styles.form}>
          <h1>Peça seu projeto</h1>
          <p>Preencha o formulário para podermos entrar em contato</p>

          <form id="formulario" onSubmit={formik.handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Nome completo"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="E-mail profissional"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.email}
              required
            />
            <Input
              id="phone"
              name="phone"
              type="text"
              placeholder="Celular/Whatsapp"
              pattern="^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.phone}
              required
            />
            <Input
              id="website"
              name="website"
              type="text"
              placeholder="Site"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.website}
              required
            />
            <Input
              id="local"
              name="local"
              type="text"
              placeholder="local do Serviço"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.local}
              required
            />
            <Select
              id="servico"
              name="servico"
              placeholder="Serviço desejado"
              options={[
                { label: "GEORREFERENCIAMENTO DE IMÓVEIS RURAIS", value: "GEORREFERENCIAMENTO_DE_IMÓVEIS_RURAIS" },
                { label: "REGULARIZAÇÃO DE IMÓVEIS RURAIS", value: "REGULARIZAÇÃO_DE_IMÓVEIS_RURAIS" },
                { label: "DESMEMBRAMENTO, REMEMBRAMENTO", value: "DESMEMBRAMENTO_REMEMBRAMENTO" },
                { label: "LOCAÇÃO DE OBRA", value: "LOCAÇÃODE_OBRA" },
                { label: "GEOPROCESSAMENTO", value: "GEOPROCESSAMENTO" },
                { label: "PROJETO DE AS BUILT", value: "PROJETO_DE_ASBUILT" },
                { label: "USUCAPIÃO", value: "USUCAPIAO" },
                { label: "LEVANTAMENTO TOPOGRÁFICO", value: "LEVANTAMENTO_TOPOGRÁFICO" },
                { label: "PROJETO DE TERRAPLENAGEM", value: "PROJETO_DE_TERRAPLENAGEM" },
              ]}
              onChange={formik.handleChange}
              value={formik.values.servico}
              required
            />
            <Input
              id="detalhes"
              name="detalhes"
              type="text"
              placeholder="Conte Mais Sobre Suas Necessidades"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.detalhes}
              required
            />

            <Button type="submit" title="Enviar" kind="full" />
          </form>
        </div>
        <div className={Styles.footer}>
          <p>
            Ao enviar esse formulário, você reconhece que leu e concorda com a
            nossa
            <Link href="/">
              <span> Política de Privacidade.</span>
            </Link>
          </p>
        </div>
      </div>
      <Script src='https://www.google.com/recaptcha/api.js?render=6Lf0A_sqAAAAAPA6RSKU7_p13QQ3Hq88rb-olUeh' />
      </>
  );
};

export default Contato;
