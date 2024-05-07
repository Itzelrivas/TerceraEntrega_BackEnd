import dotenv from 'dotenv';
dotenv.config();

// Exportamos las variables de entorno
export default {
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET, 
    secret: process.env.SESSIONS_SECRET,
    email: process.env.GMAIL_ACCOUNT,
    appEmailPass: process.env.GMAIL_APP_PASSWORD
};