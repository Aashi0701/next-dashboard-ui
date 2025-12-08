export type Role = "admin" | "teacher" | "student" | "parent";

export type ClerkSessionMetadata = {
  role?: Role;
  classId?: number;
};

export type SessionUser = {
  userId: string;
  role: Role;
  classId?: number;
};
