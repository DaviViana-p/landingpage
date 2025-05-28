import axios from "axios";
import jwt from "jsonwebtoken";

const JWT_SECRET = "SUA_CHAVE_JWT_FORTE"; // Troque por uma chave forte e guarde em variável de ambiente

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { username, password } = req.body;

  try {
    const response = await axios.post(
      "http://145.223.75.113:8080/geoserver/j_spring_security_check",
      new URLSearchParams({
        username: username,
        password: password,
        j_username: username,
        j_password: password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
        validateStatus: () => true,
        maxRedirects: 0,
      }
    );

    // LOGS PARA DEPURAÇÃO
    console.log("GeoServer response status:", response.status);
    console.log("GeoServer response headers:", response.headers);
    console.log("GeoServer response data:", response.data);

    const setCookie = response.headers["set-cookie"];
    const location = response.headers["location"];

    console.log("Set-Cookie:", setCookie);
    console.log("Location:", location);

    // Verifica se o location NÃO contém "error=true"
    if (
      response.status === 302 &&
      setCookie &&
      setCookie.some((c) => c.includes("JSESSIONID")) &&
      location &&
      !location.includes("GeoServerLoginPage?error=true")
    ) {
      // Login aceito!
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
      return res.status(200).json({ message: "Login bem-sucedido", token });
    } else {
      // Login rejeitado!
      return res.status(401).json({ message: "Usuário ou senha incorretos" });
    }
  } catch (error) {
    console.error("Erro ao autenticar no GeoServer:", error);
    return res.status(500).json({ message: "Erro ao autenticar no GeoServer", error: error.message });
  }
}
