import { authRepository } from "./auth.respository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../entities/user.entities";
import { ConflictException, NotFoundException } from "../../common/exceptions/ErrorResponse.exceptions";    
import dotenv from "dotenv";
import { Request, Response } from "express";
import crypto from "crypto";
import { sendEmail } from "../../config/mail.config";
dotenv.config();

export class AuthService {
    private authRespo =  new authRepository();

    async register(name: string, email: string, password: string, age?: number): Promise<User> {
        const exitUser = await this.authRespo.findByEmail(email);
        if (exitUser) {
            throw new ConflictException('User already exists');
        }
        const hasedpassword = await bcrypt.hash(password, 10);
        const userData: Partial<User> = { name, email, password: hasedpassword };
        if (age !== undefined) {
            userData.age = age;
        }
        const newUser = await this.authRespo.createUser(userData);
        return newUser
    }

    async login(email: string, password: string) {
        const user = await this.authRespo.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new NotFoundException('Invalid credentials');
        }

        const accesstoken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '5m' }
        );

        const refreshtoken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          process.env.REFRESH_JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '7d' }
        );
        
        const userData = { userid: user.id, name: user.name, email: user.email, role: user.role };
        return { userData, accesstoken, refreshtoken }
    }

    async refreshToken(req: Request) {
        const refreshtoken = req.cookies?.refreshToken;
        if (!refreshtoken) {
            throw new NotFoundException('Refresh token not found');
        }

        const refreshSecret = process.env.REFRESH_JWT_SECRET_KEY as string;
        if (!refreshSecret) {
            throw new NotFoundException('Refresh token secret is not configured');
        }

        try {
            const payload = jwt.verify(refreshtoken, refreshSecret) as any;
            const { userId, email, role } = payload;

            const newAccessToken = jwt.sign(
                { userId, email, role },
                process.env.JWT_SECRET_KEY as string,
                { algorithm: "HS256", expiresIn: '5m' }
            );

            const newRefreshToken = jwt.sign(
                { userId, email, role },
                refreshSecret,
                { algorithm: "HS256", expiresIn: '7d' }
            );

            return {
                data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
                msg: "This is new access token!"
            };
        } catch (err) {
            throw new NotFoundException('Invalid or expired refresh token');
        }
    }

    async googleLogin(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        if (!user) {
            throw new NotFoundException("This user doesnt exist!");
        }
        const findUser = await this.authRespo.findByEmail(user.email);
        if (!findUser) {
            throw new NotFoundException("This user doesnt exist!");
        }

        const payload = {
          userId: findUser.id,
          email: findUser.email,
          username: (findUser as any).username ?? "",
          role: findUser.role,
        };

        const accessToken = jwt.sign(
          { userId: payload.userId, email: payload.email, role: payload.role },
          process.env.JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
          { userId: payload.userId, email: payload.email, role: payload.role },
          process.env.REFRESH_JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async facebookLogin(user: any): Promise<{ accessToken: string; refreshToken: string }> {
        if (!user) {
            throw new NotFoundException("This user doesnt exist!");
        }
        const findUser = await this.authRespo.findByEmail(user.email);
        if (!findUser) {
            throw new NotFoundException("This user doesnt exist!");
        }

        const payload = {
          userId: findUser.id,
          email: findUser.email,
          username: (findUser as any).username ?? "",
          role: findUser.role,
        };

        const accessToken = jwt.sign(
          { userId: payload.userId, email: payload.email, role: payload.role },
          process.env.JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '5m' }
        );

        const refreshToken = jwt.sign(
          { userId: payload.userId, email: payload.email, role: payload.role },
          process.env.REFRESH_JWT_SECRET_KEY as string,
          { algorithm: "HS256", expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async logout(token: string | undefined, res: Response) {
        if (!token) {
            throw new NotFoundException("Refresh Token not found!");
        }
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            path: "/",
        };
        res.clearCookie("refreshToken", cookieOptions);
        return { msg: "Logged out" };
    }

    async forgotPassword(email: string, baseResetUrl?: string) {
        const user = await this.authRespo.findByEmail(email);
        if (!user) {
            return { msg: "If that email exists, a reset link has been sent" };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresInMinutes = parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES ?? "30", 10);
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        await this.authRespo.save(user);

        const appName = process.env.APP_NAME ?? "App";
        const from = process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "no-reply@example.com";
        const resetUrl = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        const subject = `${appName} - Password Reset`;
        const text = `You requested a password reset. Open this link to reset your password:\n${resetUrl}\nToken: ${token}\nIf you did not request this, you can ignore this email.`;
        const html = `<p>You requested a password reset.</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p><strong>Token:</strong> ${token}</p>
<p>If you did not request this, you can ignore this email.</p>`;

        if ((process.env.LOG_RESET_URL ?? 'true').toLowerCase() === 'true') {
            console.log('[AuthService] Password reset URL:', resetUrl);
        }

        await sendEmail({ from, to: email, subject, text, html });

        return { msg: "If that email exists, a reset link has been sent" };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.authRespo.findByValidResetToken(token, new Date());
        if (!user) {
            throw new NotFoundException("Invalid or expired reset token");
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetToken = null as any;
        user.resetTokenExpiry = null as any;
        await this.authRespo.save(user);

        return { msg: "Password has been reset successfully" };
    }
}