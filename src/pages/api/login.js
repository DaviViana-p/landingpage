export default async function handler(req, res) {
  const { username, password } = req.body;
  if (username === "admin" && password === "senha123") {
    return res.status(200).json({ message: "Login bem-sucedido" });
  } else {
    return res.status(401).json({ message: "Usuário ou senha incorretos" });
  }
}
