import jwt, { SignOptions } from "jsonwebtoken";

type GenerateTokenOptions = {
    secret?: string;
    expiresIn?: SignOptions["expiresIn"];
};

const generateToken = (
    payload: object,
    options?: GenerateTokenOptions
) => {
    return jwt.sign(
        payload,
        options?.secret ?? process.env.JWT_ACCESS_SECRET!,
        {
            expiresIn: options?.expiresIn ?? "15m",
        }
    );
};

export default generateToken;