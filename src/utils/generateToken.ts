import jwt, { SignOptions } from "jsonwebtoken";

const generateToken = (
    payload: object,
    expiresIn: SignOptions["expiresIn"] = "1d"
) => {
    return jwt.sign(payload, process.env.JWT_Secret_Key!, { expiresIn });
};

export default generateToken;