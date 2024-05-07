import { Router } from 'express';
import { githubCallbackController, loginGitHub, loginUser, registerUser } from '../controllers/passport.Controller.js';
import { failLogin, failRegister } from '../controllers/users.Controller.js';

const router = Router();

//Ruta para iniciar sesion con gitHub
router.get('/github', loginGitHub)

//Ruta que se renderiza al inicar sesión con GitHub ✅
router.get('/githubcallback', githubCallbackController)

//Ruta users/register para registrar nuevos usuarios (POST) ✅ 
router.post("/register", registerUser);

//Ruta users/login para loguear usuarios (POST)
router.post("/login", loginUser);

router.get("/fail-register", failRegister)

router.get("/fail-login", failLogin)

export default router;