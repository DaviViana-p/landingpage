import { SMTPClient } from "emailjs";

export default async function handler(req, res) {
  const { messageBody } = req.body;
  const tokenPart = messageBody.split(",")[0]; 
  const token = tokenPart.split(":")[1]; 
  const messageWithoutToken = messageBody.replace(tokenPart, "").trim();  
  const cleanedMessage = messageWithoutToken.replace(/^,|,$/g, '').trim();

  const recaptchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    { method: 'POST' }
  );

  const data = await recaptchaResponse.json();

  if (!data.success) {
    return res.status(400).json({ message: "ReCAPTCHA failed" });
  }

  const client = new SMTPClient({
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: "smtp.zoho.com",
    ssl: true,
    port: 465,
  });

  try {
    await client.sendAsync({
      text: cleanedMessage,
      from: "rodrigo@rvstopografia.com",
      to: "contato@rvstopografia.com",
      subject: "Lead - Landingpage",
    });

    res.status(200).json({ message: "Email enviado com sucesso" });
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    res.status(500).json({ message: "Erro ao enviar e-mail" });
  }
}
