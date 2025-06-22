import jwt, { JwtPayload } from "jsonwebtoken";

export default class JwtService {
  private JWT_SERCRECT_KEY: any;
  private JWT_EXPIRATION: any;
  constructor() {
    this.JWT_EXPIRATION = process.env.JWT_EXPIRATION;
    this.JWT_SERCRECT_KEY = process.env.JWT_SERCRECT_KEY;
  }

  /**
   * @desc generate jwt token
   * @param payload
   * @returns
   */
  async generateJwtToken(payload: JwtPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        this.JWT_SERCRECT_KEY,
        { expiresIn: this.JWT_EXPIRATION },
        (err, token: any) => {
          if (err) {
            // console.log(err)
            reject(err);
          } else {
            resolve(token);
          }
        }
      );
    });
  }

  /**
   * @desc verify jwt token
   * @param token
   * @returns
   */
  async verifyJwtToken(token: string): Promise<JwtPayload | null> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.JWT_SERCRECT_KEY, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
  }

  /**
   * desc refresh jwt token
   * @param oldToken
   * @returns
   */
  async refreshJwtToken(oldToken: string): Promise<string | null> {
    try {
      const decoded = await this.verifyJwtToken(oldToken);
      if (decoded) {
        // Create a new token with the same payload
        const { userId, ...rest } = decoded; // Exclude userId if needed
        return await this.generateJwtToken({ userId, ...rest });
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return null;
  }

  /**
   * @desc decode jwt token
   * @param token
   * @returns
   */
  decodeJwtToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error("Token decode failed:", error);
      return null;
    }
  }
}
