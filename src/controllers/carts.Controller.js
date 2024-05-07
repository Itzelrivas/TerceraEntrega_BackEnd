import { emailByCartId } from "../models/users/usersData.js";
import { getCartsService, createCartService, getCartPopService, addProductToCartService, deleteProductToCartService, deleteProductsCartService, updateCantProductsService, updateProductsCartService, addProductToCartBy_IdService, getCartPopBy_IdService, purchaseCartService } from "../services/carts.Service.js";;
import { getProductIdService, getProduct_IdService } from "../services/products.Service.js";


//Obtiene los carts
export const getCartsController = async (request, response) => {
    try {
        let carts = await getCartsService();
        if (!carts) {
            return response.status(404).send(`No hay carritos disponibles.`);
        }
        return response.send(carts);;
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        return response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pueden mostrar los carritos con population.</h2>');
    }
}

//Crea un nuevo carrito
export const createCartsController = async (request, response) => {
    try {
        const cart = {
            products: []
        };
        await createCartService(cart)
        return response.send(`Se ha creado un nuevo carrito con id=${cart.id}`)
    } catch (error) {
        console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo crear un carrito.</h2>')
    }
}

//Obtenemos un carrito con population
export const getCarPopController = async (request, response) => {
    try {
        let cartId = request.params.cid;
        cartId = parseInt(cartId)
        const searchCart = await getCartPopService(cartId);
        if (!searchCart) {
            return response.status(404).send(`El carrito con id=${cartId} no fue encontrado`);
        }
        console.log(JSON.stringify(searchCart, null, '\t'));
        return response.send(searchCart);
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        return response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo mostrar el carrito con population.</h2>');
    }
}

//Agregamos un producto específico a un carrito específico
export const addProductToCartController = async (request, response) => {
    try {
        let cartId = request.params.cid;
        let productId = request.params.pid;
        cartId= parseInt(cartId)
        productId = parseInt(productId)

        // Verificar si el carrito existe
        const cart = await getCartPopService(cartId);
        if (!cart) {
            return response.send(`El carrito con el id=${cartId} no existe.`);
        }

        // Verificar si el producto existe
        const product = await getProductIdService(productId) 
        if (!product) {
            return response.send(`El producto con el id=${productId} no existe.`);
        }

        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(item => item.product.toString() === product._id.toString());
        if (existingProductIndex !== -1) {
            // Si el producto ya está en el carrito, incrementar la cantidad
            cart.products[existingProductIndex].quantity++;
        } else {
            // Si el producto no está en el carrito, agregarlo al carrito con cantidad 1
            cart.products.push({ product: product._id, quantity: 1 });
        }

        // Actualizar el carrito en la base de datos
        await addProductToCartService(cartId, productId)

        return response.send(`Se ha agregado el producto con el id=${productId} al carrito con id=${cartId}`);
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo agregar un producto al carrito.</h2>');
    }
}

//Agregamos un producto específico al carrito del user logueado 
export const addProductToCartBy_IdController = async (request, response) => {
    try {
        if (!request.session.user || !request.session.user.cart) {
            return response.send(`Para poder agregar productos a tu carrito, tienes que iniciar sesión primero :)`);
        }
        const cartId = request.session.user.cart
        console.log(cartId)
        let product_Id = request.params.p_id

        //Tenemos queu hacer un service que busque un cart mediante su _id
        // Verificar si el carrito existe
        const cart = await getCartPopBy_IdService(cartId);
        if (!cart) {
            return response.send(`El carrito con el id=${cartId} no existe. Es necesario que te registres.`);
        }

        // Verificar si el producto existe
        const product = await getProduct_IdService(product_Id) 
        if (!product) {
            return response.send(`El producto con el _id=${product_Id} no existe.`);
        }

        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(item => item.product.toString() === product._id.toString());
        if (existingProductIndex !== -1) {
            // Si el producto ya está en el carrito, incrementar la cantidad
            cart.products[existingProductIndex].quantity++;
        } else {
            // Si el producto no está en el carrito, agregarlo al carrito con cantidad 1
            cart.products.push({ product: product._id, quantity: 1 });
        }

        // Actualizar el carrito en la base de datos
        await addProductToCartBy_IdService(cartId, product_Id)

        return response.send(`Producto agregado`);
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo agregar un producto al carrito.</h2>');
    }
}

//Elimindamos un producto específico de un carrito
export const deleteProductToCartController = async (request, response) => {
    try {
        let cartId = request.params.cid
        let productId = request.params.pid
        cartId = parseInt(cartId)
        productId = parseInt(productId)

        let idSearch = await getCartPopService(cartId);
        if (idSearch) {
            let productsCart = idSearch.products //Productos del carrito
            let productsIdCart = productsCart.map(prod => prod.product.id) //Guarda los id´s de los productos de mi carrito y genera la proipiedad .product dentro del array products
            let productSearch = await getProductIdService(productId) 
            
            if (productsIdCart.includes(productSearch.id)) {
                await deleteProductToCartService(cartId, productId)
                return response.send(`Se ha eliminado el producto con el id=${productId} del carrito con id=${cartId}`)
            }
            else {
                return response.send(`Oh Oh, no puedes eliminar el producto con el id=${productId} porque no existe en él :(`)
            }
        }
        return response.send({ msg: `El carrito con el id=${cartId} no existe.` })
        
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo eliminar un producto del carrito.</h2>');
    }
}

//Elimina todos los productos de un carrito específico
export const deleteProductsCartController = async (request, response) => {
    try {
        let cartId = request.params.cid
        cartId = parseInt(cartId)
        
            let idSearch = await getCartPopService(cartId);
            if (idSearch) {
                await deleteProductsCartService(cartId)
            }
            else {
                return response.send(`Oh Oh, no puedes eliminar el carrito con el id=${cartId} porque no existe :(`)
            }
            return response.send(`Se han eliminado los productos del carrito con id=${cartId}`);
        
    } catch (error) {
        console.error("Ha surgido este error: " + error)
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo eliminar un producto del carrito.</h2>')
    }
}

//Actualiza la cantidad que hay de un producto en un carrito específico
export const updateCantProductsController = async (request, response) => {
    try {
        let cartId = request.params.cid
        cartId = parseInt(cartId)
        let productId = request.params.pid
        productId = parseInt(productId)
        let newQuantity = request.body

        const cart = await getCartPopService(cartId);
        if (!cart) {
            return response.send(`El carrito con el id=${cartId} no existe.`);
        }
        
        if (cart.products.length > 0) {
            // Verificar si el producto existe
            const product = await getProductIdService(productId) 
            if (!product) {
                return response.send(`El producto con el id=${productId} no existe.`);
            }

            // Verificar si el producto ya está en el carrito
            const existingProductIndex = cart.products.findIndex(item => item.product.id === product.id);
            console.log(existingProductIndex)
            if (existingProductIndex !== -1) {
                await updateCantProductsService(cartId, productId, newQuantity)
                return response.send(`Se ha actualizado la cantidad de ejemplares del producto con el id=${productId} en el carrito con id=${cartId}`);
            } else {
                return response.send(`El producto con el id=${productId} no existe en el carrito con el id=${cartId}.`);
            }
        }
        else {
            return response.send(`El carrito con el id=${cartId} esta vacío.`);
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send(`<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo modificar la cantidad del prodructo con id=${product} del carrito con id=${cartId}.</h2>`);
    }
}

//Actualiza los productos de un carrito específico
export const updateProductsCartController = async (request, response) => {
    try {
        let cartId = parseInt(request.params.cid)
        let newProducts = request.body
        //let carts = await getCartsService()
        const cart = await getCartPopService(cartId);
        //carts.find(cart => cart.id === cartId)
        if (!cart) {
            return response.send(`El carrito con el id=${cartId} no existe.`);
        }
        else {
            cart.products = newProducts
        }
        // Actualizar el carrito en la base de datos
        await updateProductsCartService(cartId, newProducts)
        return response.send(`Se ha actualizado los productos del carrito con id=${cartId}`);
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send(`<h2 style="color: red">¡Oh oh! Ha surgido un error, por lo tanto, no se pudo modificar los productos del carrito con id=${cartId}.</h2>`);
    }
}

//Obtenemos los productos populados de un carrito
export const getProductsCart = async (request, response) => {
    try {
        let cartId = parseInt(request.params.cid)
        let cart = await getCartPopService(cartId)
        if (cart) {
            let productsCart = cart.products.map(product => product.product.toObject()); // Convertimos los documentos de los productos a objetos simples de JavaScript

            productsCart.id = parseInt(cartId)
            if (productsCart.length > 0) {
                response.render('productsCart', {
                    style: "viewsHandlebars.css",
                    productsCart
                });
            } else {
                productsCart.none = `¡Oh oh! El carrito con id=${cartId} está vacío.`
                return response.render('productsCart', {
                    style: "viewsHandlebars.css",
                    productsCart
                });
            }
        } else {
            return response.send(`El carrito con id=${cartId} no existe :(`)
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error y no se pueden mostrar los productos.</h2>');
    }
}

//Finalizamos la compra segun el carrito definido mediante params
export const purchaseCartController = async (request, response) => {
    try {
        let cartId = parseInt(request.params.cid)
        let email = await emailByCartId(cartId)
        console.log(email)
        if(!email){
            return response.send(`El carrito con id = ${cartId} no esta asociado a ningún usuario.`);
        }
        let leftProducts = await purchaseCartService(cartId, email)
        if(leftProducts.length === 0){
            return response.send(`Todos los productos fueron procesados correctamente. La compra ha finalizado exitosamente :)`)
        } else{
            return response.send(`Se ha finalizado la compra del carrito con id=${cartId} :). Los productos que no se pudieron procesar son ${leftProducts}`)
        }
    } catch (error) {
        console.error("Ha surgido este error: " + error);
        response.status(500).send('<h2 style="color: red">¡Oh oh! Ha surgido un error y no se pueden mostrar los productos.</h2>');
    }
}