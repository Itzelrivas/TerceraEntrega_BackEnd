import { userModel } from '../models/users/user.model.js';
import { cartsModel } from '../models/carts/carts.model.js';
import { createHash, isValidPassword } from '../../utils.js';
import { emailByCartId, getCartUser } from "../models/users/usersData.js"

//Registro de user
export const registerUser = async (userData) => {
    const { first_name, last_name, email, age, cart, password, role } = userData;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            console.log("El usuario ya existe!!");
            return null; // Indica que el usuario ya existe
        } else {
            let idCart = null;
            if (cart.trim() !== "") {
                const existingCart = await cartsModel.findOne({ id: cart });
                if (!existingCart) {
                    console.log("El carrito no existe!");
                    return "El carrito no existe!"; // Indica que el carrito no existe
                } else {
                    idCart = existingCart._id;
                }
            }
            
            const hashedPassword = createHash(password);
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: hashedPassword,
                cart: idCart,
                role
            };
            const result = await userModel.create(newUser);
            return result; // Devuelve el usuario creado
        }
    } catch (error) {
        console.error("Error registrando el usuario:", error);
        throw error; // Lanza el error para que sea manejado por el controlador
    }
};

//Login de user
export const loginUser = async (username, password) => {
    try {
        const user = await userModel.findOne({ email: username });
        if (!user) {
            console.warn("Invalid credentials for user:", username);
            return false; // Indica credenciales inválidas
        }
        if (!isValidPassword(user, password)) {
            console.warn("Invalid credentials for user:", username);
            return false; // Indica credenciales inválidas
        }
        return user; // Devuelve el usuario autenticado
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error; // Lanza el error para que sea manejado por el controlador
    }
};

//Obtenemos el carrito asociado a un usuario específico mediante el email registrado
export const getCartUserService = async (email) => {
    return await getCartUser(email)
}

//Obtenemos el email del user segun su _id del carrito
export const emailByCartIdService = async (id) => {
    return await emailByCartId(id)
}
