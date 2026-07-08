import jwt from "jsonwebtoken";

export const verifyJWT = async<T>(token: string, secret: string): Promise<T> => {
    return jwt.verify(token, secret) as T;
};  