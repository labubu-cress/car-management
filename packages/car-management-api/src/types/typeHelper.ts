export type OmitPasswordHash<T> = Omit<T, "passwordHash">;

export type ReplacePasswordHash<T> = Omit<T, "passwordHash"> & {
  password: string;
};
