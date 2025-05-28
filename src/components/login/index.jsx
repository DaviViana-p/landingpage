import { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Styles from "./login.module.scss";
import Button from "../button";
import Input from "../input";
import { Loading } from "../loading";
import { SuccessModal } from "../successModal";
import { FailModal } from "../failModal";
import { useRouter } from "next/router";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [failModal, setFailModal] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Campo obrigatório"),
      password: Yup.string().required("Campo obrigatório"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values) => handleSubmit(values),
  });

  const handleSubmit = (values) => {
    setIsLoading(true);
    axios
      .post("/api/login", {
        username: values.username,
        password: values.password,
      })
      .then((res) => {
        setIsLoading(false);
        // Armazena o token JWT no localStorage
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        router.push("/webgis");
      })
      .catch(() => {
        setIsLoading(false);
        setFailModal(true);
      });
  };

  const closeModal = () => {
    setSuccessModal(false);
    setFailModal(false);
  };

  return (
    <>
      {successModal && <SuccessModal closeModal={closeModal} />}
      {failModal && <FailModal closeModal={closeModal} />}
      {isLoading && <Loading />}
      <div className={Styles.container}>
        <div className={Styles.texts}>
          <h1>Login</h1>
          <p>Por favor, insira suas credenciais para acessar sua conta.</p>
        </div>
        <div className={Styles.form}>
          <form onSubmit={formik.handleSubmit}>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Nome de usuário"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.username}
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Senha"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.password}
              required
            />
            <Button type="submit" title="Entrar" kind="full" />
          </form>
        </div>
        <div className={Styles.footer}>
          <p>
            Esqueceu sua senha?{" "}
            <a href="#">Clique aqui para recuperar</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
