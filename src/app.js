import express from 'express';
import handlebars from 'express-handlebars';
//Dependencias para las sessions 
import session from 'express-session'; 
import MongoStore from 'connect-mongo';
//Importamos utils, socket y mongoose
import __dirname from '../utils.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
//importamos mis archivos de routes
import productsRoutes from './routes/products.router.js'
import cartsRoutes from './routes/carts.router.js'
import homeHandlebars from './routes/views.router.js'
import usersRoutes from './routes/usersViews.router.js'
import sessionsRoutes from './routes/sessions.router.js'
import githubLoginRouter from '../src/routes/githubLoginViews.router.js'
//Variables de entorno
import config from './config/config.js'
//Servicios del caht (prueba)
import { createMessageService, findUserMessagesService, updateMessageService } from './services/chat.Service.js';
//Esto es para poder pasar el comando y que inicie la lógica de persisteencia con MongoDB
import yargs from 'yargs/yargs';

const app = express();
const PORT = config.port

//Preparar la configuracion del servidor para recibir objetos JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Uso de vista de plantillas
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + "/src/views");

// Indicamos que vamos a trabajar con archivos estaticos
app.use(express.static(__dirname + "/src/public"))//Antes solo estaba /public

// Conexión con Mongo mediante una flag
let PERSISTENCE
const args = yargs(process.argv.slice(2)).argv;

if (args.mongo) {
    PERSISTENCE = 'mongo';

	//Configuración y conexión con Mongo
    const URL_MONGO = config.mongoUrl;

    const connectMongoDB = async () => {
        try {
            await mongoose.connect(URL_MONGO);
            console.log("Conexión exitosa a MongoDB");
        } catch (error) {
            console.error("No se pudo conectar a la base de datos usando Mongoose debido a: " + error);
            process.exit(1); // Sale con un código de error
        }
    }

    connectMongoDB();

	//Configuración de sesiones
	app.use(session({
		store: MongoStore.create ({
			mongoUrl: URL_MONGO,
			//mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true }, las eliminamos porque están obsoletas y no tienen efecto en la versión que tengo de mongo
			ttl: 10 * 60
		}),
		secret: config.secret,
		resave: false, //guarda en memoria
		saveUninitialized: true //lo guarda a penas se crea
	}))
} else {
    console.error("Argumento '--persist' no encontrado en el comando");
    process.exit(1); // Sale con un código de error
}


//Puntos de entrada para routes:
app.use('/api/sessions', sessionsRoutes);
app.use('/users', usersRoutes);
app.use("/github", githubLoginRouter)
app.use('/api/products', productsRoutes)
app.use('/api/carts', cartsRoutes)
app.use('/handlebars', homeHandlebars);


const httpServer = app.listen(PORT, () => {
	(`Server run on port: ${PORT}`);
})

//Instanciamos socket.io
export const socketServer = new Server(httpServer);
//Creamos el array para guardar mis mensajes
const messages = []
socketServer.on('connection', socket => {
	console.log('Un cliente se ha conectado.');

	//Con esto las personas pueden ver los mensajes anteriores
	socketServer.emit('messageLogs', messages);

	socket.on("message", async data => {
		try {
			//Agregamos la data a nuestro array:
			messages.push(data)
			//Actualizamos nuestra base de datos:
			const existingUserMessage = await findUserMessagesService(data.user)
			if (existingUserMessage) {
				await updateMessageService(data.user, data.message)
			} else {
				await createMessageService(data)
			}
			//enviamos todos los mensajes para que se impriman en tiempo real
			socketServer.emit('messageLogs', messages);
		} catch (error) {
			console.error("Error al guardar el mensaje:", error);
		}
	});

	//Salgo del chat
	socket.on('closeChat', data => {
		if (data.close === "close")
			socket.disconnect();
	})
})

