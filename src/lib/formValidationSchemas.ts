import { z } from "zod";

// Class
export const classSchema = z.object({
  id: z.number().optional(),

  name: z.string().min(1, "Class name is required"),

  capacity: z
    .number({
      message: "Capacity is required",
    })
    .min(1, "Capacity must be at least 1"),

  gradeId: z.number().optional(),

  supervisorId: z
    .string({
      message: "Supervisor is required",
    })
    .min(1, "Supervisor is required"),
});

export type ClassSchema = z.infer<typeof classSchema>;

// Lesson
export const lessonSchema = z.object({
  id: z.number().optional(),

  name: z.string().min(1, "Lesson name is required"),

  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ]),

  startTime: z.date({
    message: "Start time is required",
  }),

  endTime: z.date({
    message: "End time is required",
  }),

  subjectId: z.number().min(1, "Subject is required"),

  classId: z.number().min(1, "Class is required"),

  teacherId: z.string().min(1, "Teacher is required"),
});

export type LessonFormValues = z.infer<typeof lessonSchema>;

// Subject
export const subjectSchema = z.object({
  id: z.number().optional(),

  name: z.string().min(1, "Subject name is required"),

  teachers: z
    .array(z.string())
    .min(1, "At least one teacher must be assigned"),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

// Teacher
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^\S+$/, "Username cannot contain spaces"),

  email: z
    .string()
    .email("Invalid email address")
    .or(z.literal("")),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain 1 uppercase letter")
    .regex(/[a-z]/, "Must contain 1 lowercase letter")
    .regex(/[0-9]/, "Must contain 1 number")
    .or(z.literal("")),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),

  /* ================= PERSONAL ================= */

  name: z
    .string()
    .min(1, "First name is required"),

  surname: z
    .string()
    .min(1, "Last name is required"),

  address: z
    .string()
    .min(1, "Address is required"),

  bloodType: z
    .string()
    .min(1, "Blood type is required"),

  /* ⭐ optional but valid date */
  birthday: z.date().optional(),

  sex: z.enum(["MALE", "FEMALE"], {
    message: "Sex is required",
  }),

  /* ================= OPTIONAL ================= */

  img: z.string().optional(),

  subjects: z.array(z.string()).optional(),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

// Student
export const studentSchema = z.object({
  id: z.string().optional(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),

  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),

  email: z.string().email("Invalid email").optional().or(z.literal("")),

  phone: z.string().optional().or(z.literal("")),

  address: z.string().min(1, "Address is required"),

  img: z.string().optional(),

  bloodType: z.string().min(1, "Blood type is required"),

  birthday: z.date().optional(), // ✅ optional like Teacher

  sex: z.enum(["MALE", "FEMALE"]),

  gradeId: z.number().min(1, "Grade is required"),
  classId: z.number().min(1, "Class is required"),

  parentId: z.string().min(1, "Parent is required"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

// Parent
export const parentSchema = z.object({
  id: z.string().optional(),

  username: z.string().min(1, "Username is required"),

  name: z.string().min(1, "First name is required"),

  surname: z.string().min(1, "Last name is required"),

  email: z.string().email("Invalid email").optional().or(z.literal("")),

  phone: z.string().min(1, "Phone is required"),

  address: z.string().min(1, "Address is required"),
});

export type ParentFormValues = z.infer<typeof parentSchema>;

// Exam
export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, "Title name is required"),
  startTime: z.coerce.date({ message: "Start time is required" }),
  endTime: z.coerce.date({ message: "End time is required" }),
  lessonId: z.coerce.number().min(1, "Lesson is required"),
});

export type ExamFormValues = z.infer<typeof examSchema>;

// Assignment
export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(1, "Title is required"),

  startDate: z.coerce.date({ message: "Start Date is required" }),

  dueDate: z.coerce.date({ message: "Due Date is required" }),

  lessonId: z.coerce.number({ message: "Lesson is required" }),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

// Result
export const resultSchema = z
  .object({
    id: z.coerce.number().optional(),

    score: z.coerce
      .number()
      .min(0, "Score must be at least 0")
      .max(100, "Score cannot exceed 100"),

    studentId: z.string().min(1, "Student is required"),

    examId: z.coerce.number().optional(),
    assignmentId: z.coerce.number().optional(),
  })
  .refine((data) => data.examId || data.assignmentId, {
    message: "Select either an exam or an assignment",
    path: ["examId"],
  });

export type ResultFormValues = z.infer<typeof resultSchema>;

// Attendance
export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1),
  lessonId: z.coerce.number(),
  date: z.coerce.date(),
  present: z.coerce.boolean(),
});

export type AttendanceFormInput = z.input<typeof attendanceSchema>;
export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

// Fee
export const FeeSchema = z.object({
  id: z.number().optional(),

  title: z.string().min(1),
  amount: z.coerce.number().positive(),

  classId: z.coerce.number().nullable().optional(),

  type: z.enum(["ADMISSION", "TERM", "ANNUAL", "MISC"]),
  term: z.enum(["TERM_1", "TERM_2"]).nullable().optional(),

  isActive: z.boolean().optional(),
});

export type FeeFormInput = z.input<typeof FeeSchema>;   // server boundary only
export type FeeSchemaType = z.infer<typeof FeeSchema>;

// AssignFee
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

export type AssignFeeFormInput = z.input<typeof assignFeeSchema>;
export type AssignFeeValues = z.infer<typeof assignFeeSchema>;

// Event
export const eventSchema = z.object({
  id: z.coerce.number().optional(),

  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),

  classId: z.coerce.number().optional().nullable(),
  category: z.string().optional(),
});

export type EventFormInput = z.input<typeof eventSchema>;
export type EventFormValues = z.infer<typeof eventSchema>;

export const announcementFormSchema = z.object({
  id: z.number().optional(),

  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  date: z.date({
    message: "Date is required",
  }),

  classId: z.string().optional().nullable(), // 👈 UI stays string
});

export type AnnouncementFormInput = z.input<typeof announcementFormSchema>;
export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export type AnnouncementSchema = {
  id?: number;
  title: string;
  description: string;
  date: Date;
  classId: number | null;
};

export const holidaySchema = z.object({
  id: z.number().optional(),

  title: z.string().min(1, "Title is required"),
  date: z.date(),

  // UI value only
  isFullDay: z.enum(["FULL", "HALF"]),
});

export type HolidayFormInput = z.input<typeof holidaySchema>;
export type HolidayFormValues = z.infer<typeof holidaySchema>;
