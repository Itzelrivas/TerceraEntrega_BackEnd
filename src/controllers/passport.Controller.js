import passport from 'passport';
import { initializePassport } from '../services/passport.Service.js';

initializePassport()

//Registro de usuario con passport
export const registerUser = (req, res, next) => {
    passport.authenticate('register', { 
        failureRedirect: '/api/sessions/fail-register' 
    })(req, res, next); 

    console.log("Registrando nuevo usuario.");
    res.status(200).send({ status: 'success', message: "Usuario creado de forma exitosa!!" });
};

//Login del usuario con passport
export const loginUser = (request, response, next) => { 
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return response.status(401).send({ status: "error", error: "El usuario y la contraseña no coinciden!" });
        }
        request.login(user, (err) => {
            if (err) {
                return next(err);
            }
            console.log("Usuario encontrado:");
            console.log(user);
            request.session.user = {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email, 
                age: user.age,
                role: user.role,
                cart: user.cart
            };
            response.send({ status: "success", payload: request.session.user, message: "Primer logueo realizado! :)" });
        });
    })(request, response, next);
};

//Login del usuario mediante GitHub
export const loginGitHub = (req, res, next) => {
    passport.authenticate('github', {
        scope: ['user:email'], 
    })(req, res, next); 
};

//Callback de gitHub
export const githubCallbackController = (request, response, next) => {
    passport.authenticate('github', { failureRedirect: '/api/sessions/fail-login' })(request, response, async () => {
        const user = request.user;
        if(user){
            // Asignamos roles si es necesario
            if (user.email === 'adminCoder@coder.com') {
                user.role = 'administrador';
            }

            // Creamos la sesión del usuario
            request.session.user = {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                age: user.age,
                role: user.role
            };

            // Redirigimos al usuario a la página de inicio
            response.redirect("/handlebars/home");
        }
        
    });
};