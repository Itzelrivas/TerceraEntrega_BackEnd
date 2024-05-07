import { getCartUserService } from "../services/users.Service.js"

//Obtenemos el carrito asociado a un user mediante el email
export const getCartUserController = async (request, response) => {
    try {
        let user_email = request.params.email
        const user = await getCartUserService(user_email)
        if (!user) {
            return response.status(404).send(`El usuario con correo ${user_email} no se ha encontrado.`);
        }
        console.log("Se pudo acceder con exito al usuario.")
        response.send(user)
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error y no se pueden mostrar el usuario.</h2>');
    }
}

//Registro de usuario
export const registerUserController = async (request, response) => {
    response.render('register', {
        style: "viewsSessions.css"
    })
}

//Login de usuario
export const loginUserController = async (request, response) => {
    response.render('login', {
        style: "viewsSessions.css"
    })
}

//Obtenemos la info del usuario
export const getInfoUser = async (request, response) => {
    const user = request.session.user
    console.log(request.session)
    response.render('current', { user })
}

//Registro no exitoso
export const failRegister = async (request, response) => {
    response.status(401).send({ error: "Failed to process register!" }) ;
}

//Login no exitoso
export const failLogin = async (request, response) => {
    response.status(401).send({ error: "Failed to process login!" });
}

//Logout
export const logout = async (request, response) => {
    request.session.destroy(error => {
        if (error){
            response.json({error: "error logout", mensaje: "Error al cerrar la sesion"});
        }
        response.redirect('/users/login');
    });   
}