import { SMTPClient } from "emailjs";

export default async function handler(req, res) {
  const { messageBody } = req.body;
  const tokenPart = messageBody.split(",")[0]; 
  const token = tokenPart.split(":")[1]; 
  const messageWithoutToken = messageBody.replace(tokenPart, "").trim();  
  const cleanedMessage = messageWithoutToken.replace(/^,|,$/g, '').trim();
  const client = new SMTPClient({
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: "smtp.gmail.com",
    ssl: true,
  });
  //console.log(token);

  fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`, {
    method: 'POST',
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        console.log("Success");
        try {
          const message =  client.sendAsync({
            text: cleanedMessage,
            from: "rodrigo@rvstopografia.com",
            to: "rodrigo@rvstopografia.com",
            subject: "Lead - Landingpage",
          });
          //console.log(message);
        } catch (err) {
          console.error(err);
        }
        
      }
      else {
        console.log("Fail");
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  

  res.status(200).json({ message: "Send Mail" });
}
