import { cartsModel } from "../carts/carts.model.js";
import { userModel } from "./user.model.js"

//Obtenemos el carrito asociado a un usuario específico
export const getCartUser = async (email) => {
    try {
        return await userModel.findOne({ email: email }).populate('cart');
    } catch (error) {
        console.error("Ha surgido este error en models de cart: " + error);
        return error;
    }
}

//Obtenemos el email del user según el id de su carrito asociado
export const emailByCartId = async (id) => {
    try {
        let cart = await cartsModel.findOne({id: id})
        let cart_Id = cart._id
        let userSearch = await userModel.findOne({cart: cart_Id})
        let userEmail = userSearch.email
        return userEmail
    } catch (error) {
        console.error("Ha surgido este error en models de cart: " + error);
        return error;
    }
}