import { AuthController } from "./auth.controller";
import { Router, Request, Response, NextFunction } from "express";
import passport from "../../config/passport.config";

export class AuthRouter {
    public router: Router;
    private authController: AuthController;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        this.routes();
    }

    private routes() {
        this.router.post('/register', this.authController.register.bind(this.authController));
        this.router.post('/login', this.authController.login.bind(this.authController));
        this.router.post('/refresh', this.authController.refresh.bind(this.authController));
        this.router.post('/logout', this.authController.logout.bind(this.authController));
        this.router.post('/forgot-password', this.authController.forgotPassword.bind(this.authController));
        this.router.post('/reset-password', this.authController.resetPassword.bind(this.authController));

        this.router.get(
            "/google",
            passport.authenticate("google", {
                scope: ["email", "profile"],
                session: false,
            })
        );

        this.router.get(
            "/google/callback",
            passport.authenticate("google", { failureRedirect: "/login", session: false }),
            this.authController.googleLogin.bind(this.authController)
        );

        this.router.get(
            "/facebook",
            passport.authenticate("facebook", {
                scope: ["email", "public_profile"],
                session: false,
            })
        );

        this.router.get(
            "/facebook/callback",
            passport.authenticate("facebook", { failureRedirect: "/login", session: false }),
            this.authController.facebookLogin.bind(this.authController)
        );
    }
}