import bcrypt from "bcryptjs";

/*
 * Hashing user password
 */
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

/*
 * Comparing User password
 */
export const ComparePassword = async (
  plainPassword: string,
  hashPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashPassword);
};
