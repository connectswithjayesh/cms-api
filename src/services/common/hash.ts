import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword); // Compare password with hashed password
    return isMatch;
  } catch (error) {
    throw new Error("Error verifying password");
  }
};
