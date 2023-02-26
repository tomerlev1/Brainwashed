import bcrypt from 'bcrypt';

export async function hashPassword(userPassword) {
      const hash = await bcrypt.hash(userPassword, 10);
      return hash;
  };

export async function comparePassword(userPassword, hash) {
      const result = await bcrypt.compare(userPassword, hash);
      return result;
  }


