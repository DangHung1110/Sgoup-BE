import { AuthService } from "./auth.service";
import { Request, Response, NextFunction } from "express";
import { HttpReponseDtos } from "../../common/dtos/httpReponse.dto";
import { ServiceResponse, ResponseStatus } from "../../common/dtos/serviceResponse.dto";

declare global {
  namespace Express {
    interface User {
    }
  }
}

export class AuthController {
    private authService = new AuthService();
    private httpResponse = new HttpReponseDtos();

    async register(req: Request, res: Response) {
        const { name, email, password, age } = req.body;
        const user = await this.authService.register(name, email, password, age);

        const reponse = new ServiceResponse(ResponseStatus.Success, 'User registered successfully', user, 201);
        this.httpResponse.created(reponse, res);
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const result = await this.authService.login(email, password);

        const refreshToken = (result as any).refreshtoken ?? (result as any).refreshToken;
        const accessToken = (result as any).accesstoken ?? (result as any).accessToken;
        const userData = (result as any).userData ?? (result as any).user;

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        if (refreshToken) {
          res.cookie("refreshToken", refreshToken, cookieOptions);
        }

        const reponse = new ServiceResponse(ResponseStatus.Success, 'Login successful', { accessToken, user: userData }, 200);
        this.httpResponse.success(reponse, res);
    }

    async refresh(req: Request, res: Response) {
        const result = await this.authService.refreshToken(req);
        const accessToken = (result as any).data?.accessToken ?? (result as any).access_token;
        const refreshToken = (result as any).data?.refreshToken ?? (result as any).refresh_token;

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        if (refreshToken) {
          res.cookie("refreshToken", refreshToken, cookieOptions);
        }

        const reponse = new ServiceResponse(ResponseStatus.Success, (result as any).msg ?? "Refreshed tokens", { accessToken }, 200);
        this.httpResponse.success(reponse, res);
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        const { accessToken, refreshToken } = await this.authService.googleLogin(req.user);
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        if (refreshToken) res.cookie("refreshToken", refreshToken, cookieOptions);
        const response = new ServiceResponse(ResponseStatus.Success, "Login with Google successful", { accessToken, user: req.user }, 200);
        this.httpResponse.success(response, res);
    }

    async facebookLogin(req: Request, res: Response, next: NextFunction) {
        const { accessToken, refreshToken } = await this.authService.facebookLogin(req.user);
        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        if (refreshToken) res.cookie("refreshToken", refreshToken, cookieOptions);
        const response = new ServiceResponse(ResponseStatus.Success, "Login with Facebook successful", { accessToken, user: req.user }, 200);
        this.httpResponse.success(response, res);
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const refreshToken = req.cookies?.refreshToken;
        await this.authService.logout(refreshToken, res);
        const response = new ServiceResponse(ResponseStatus.Success, "Log out successfully!", null, 200);
        this.httpResponse.success(response, res);
    }
}