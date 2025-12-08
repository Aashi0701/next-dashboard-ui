import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start Date is required!" }),
  dueDate: z.coerce.date({ message: "Due Date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0).max(100),
  studentId: z.string().min(1, { message: "Student is required!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  }).refine(
    (data) => data.examId || data.assignmentId,
    { message: "Provide either exam or assignment" }
);

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number().optional(),
  category: z.string().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

// formValidationSchemas.ts
export const announcementFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),          // input: string "2025-11-25"
  classId: z.string().nullable(),   // input: select → string or ""
});

export type AnnouncementFormSchema = z.infer<typeof announcementFormSchema>;

export type AnnouncementSchema = {
  id?: number;
  title: string;
  description: string;
  date: Date;
  classId: number | null;
};

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),

  studentId: z.string().min(1, "Student is required"),

  lessonId: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((v) => !isNaN(v), "Lesson is required"),

  date: z
    .union([z.string(), z.date()])
    .transform((v) => new Date(v))
    .refine((v) => v instanceof Date && !isNaN(v.getTime()), "Date is required"),

  present: z
    .union([z.string(), z.boolean()])
    .transform((v) => v === "true" || v === true),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),               // For update only
  username: z.string().min(1),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().min(1),
  address: z.string().min(1)
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const FeeSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  amount: z.number().positive(),
  classId: z.number().optional().nullable(),
  type: z.enum(["ADMISSION", "TERM", "ANNUAL", "MISC"]),
  term: z.enum(["TERM_1", "TERM_2"]).optional().nullable(),
  isActive: z.boolean().optional(),
});

export type FeeSchemaType = z.infer<typeof FeeSchema>;

export const assignFeeSchema = z
  .object({
    assignmentType: z.enum(["CLASS", "STUDENT"]),

    classId: z.coerce.number().optional(),
    studentId: z.string().optional(),
    feeStructureId: z.coerce.number(),

    dueDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.assignmentType === "CLASS" && !data.classId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Class is required",
        path: ["classId"],
      });
    }

    if (data.assignmentType === "STUDENT" && !data.studentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student is required",
        path: ["studentId"],
      });
    }
  });

export type AssignFeeSchema = z.infer<typeof assignFeeSchema>;