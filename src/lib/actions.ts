"use server";

import prisma from "./prisma";
import { clerkAdmin } from "./clerkAdmin";
import { auth } from "@clerk/nextjs/server";
import { assignFeeSchema } from "@/lib/formValidationSchemas";
import { PaymentMode, FeeStatus, Prisma } from "@prisma/client";
import {
  SubjectSchema,
  ClassSchema,
  TeacherFormValues,
  StudentFormValues,
  ExamFormValues,
  LessonFormValues,
  AssignmentFormValues,
  ResultFormValues,
  EventFormInput,
  eventSchema,
  AnnouncementSchema,
  AnnouncementFormValues,
  attendanceSchema,
  AttendanceFormInput,
  ParentFormValues,
  FeeSchemaType,
  AssignFeeValues,
} from "./formValidationSchemas";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type ActionState = {
  success: boolean;
  error?: string;
};

type AnnouncementCreateData = {
  title: string;
  description: string;
  date: Date;
  classId: number | null;
};

// ClassForm
export const createClass = async (
  _prevState: ActionState,
  data: ClassSchema,
): Promise<ActionState> => {
  try {
    // 🔐 Determine academic year on the server
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }, // or however you mark current year
      select: { id: true },
    });

    if (!academicYear) {
      return {
        success: false,
        error: "No active academic year found",
      };
    }

    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId,
        academicYearId: academicYear.id, // ✅ REQUIRED
      },
    });

    return { success: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A class with this name already exists for this academic year",
      };
    }

    console.error(error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
};

export const updateClass = async (
  _prevState: ActionState,
  data: ClassSchema,
): Promise<ActionState> => {
  try {
    await prisma.class.update({
      where: { id: data.id! },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to update class",
    };
  }
};

export const deleteClass = async (
  _prevState: ActionState,
  data: FormData,
): Promise<ActionState> => {
  const id = Number(data.get("id"));

  try {
    await prisma.class.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to delete class",
    };
  }
};

// LessonForm
export const createLesson = async (
  _prevState: ActionState,
  data: LessonFormValues,
): Promise<ActionState> => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("createLesson error:", error);
    return {
      success: false,
      error: "Failed to create lesson",
    };
  }
};

export const updateLesson = async (
  _prevState: ActionState,
  data: LessonFormValues,
): Promise<ActionState> => {
  if (!data.id) {
    return {
      success: false,
      error: "Lesson ID missing",
    };
  }

  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("updateLesson error:", error);
    return {
      success: false,
      error: "Failed to update lesson",
    };
  }
};

export const deleteLesson = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: "Lesson ID missing",
    };
  }

  try {
    await prisma.lesson.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteLesson error:", error);
    return {
      success: false,
      error: "Failed to delete lesson",
    };
  }
};

// SubjectForm
export const createSubject = async (
  _prevState: ActionState,
  data: SubjectSchema,
): Promise<ActionState> => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((id) => ({ id })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "A subject with this name already exists",
      };
    }

    console.error("createSubject error:", error);
    return {
      success: false,
      error: "Failed to create subject",
    };
  }
};

export const updateSubject = async (
  _prevState: ActionState,
  data: SubjectSchema,
): Promise<ActionState> => {
  if (!data.id) {
    return {
      success: false,
      error: "Subject ID missing",
    };
  }

  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((id) => ({ id })),
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("updateSubject error:", error);
    return {
      success: false,
      error: "Failed to update subject",
    };
  }
};

export const deleteSubject = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const id = Number(formData.get("id"));

  if (!id) {
    return {
      success: false,
      error: "Subject ID missing",
    };
  }

  try {
    await prisma.subject.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteSubject error:", error);
    return {
      success: false,
      error: "Failed to delete subject",
    };
  }
};

// TeacherForm
export const createTeacher = async (
  _prevState: ActionState,
  data: TeacherFormValues,
): Promise<ActionState> => {
  try {
    const user = await clerkAdmin.users.createUser({
      username: data.username,
      password: data.password || undefined,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    // ✅ BUILD PRISMA DATA OBJECT SAFELY
    const teacherData: Prisma.TeacherCreateInput = {
      id: user.id,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
    };

    // ✅ add birthday ONLY if defined
    if (data.birthday) {
      teacherData.birthday = data.birthday;
    }

    // ✅ add subjects ONLY if present
    if (data.subjects && data.subjects.length > 0) {
      teacherData.subjects = {
        connect: data.subjects.map((id) => ({
          id: Number(id),
        })),
      };
    }

    await prisma.teacher.create({
      data: teacherData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("createTeacher error:", error);
    return {
      success: false,
      error: error?.errors?.[0]?.message ?? "Failed to create teacher",
    };
  }
};

export const updateTeacher = async (
  _prevState: ActionState,
  data: TeacherFormValues,
): Promise<ActionState> => {
  if (!data.id) {
    return { success: false, error: "Teacher ID missing" };
  }

  try {
    await clerkAdmin.users.updateUser(data.id, {
      username: data.username,
      ...(data.password ? { password: data.password } : {}),
      firstName: data.name,
      lastName: data.surname,
    });

    const teacherData: Prisma.TeacherUpdateInput = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
    };

    if (data.birthday) {
      teacherData.birthday = data.birthday;
    }

    if (data.subjects) {
      teacherData.subjects = {
        set: data.subjects.map((id) => ({
          id: Number(id),
        })),
      };
    }

    await prisma.teacher.update({
      where: { id: data.id },
      data: teacherData,
    });

    return { success: true };
  } catch (error) {
    console.error("updateTeacher error:", error);
    return {
      success: false,
      error: "Failed to update teacher",
    };
  }
};

export const deleteTeacher = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const id = String(formData.get("id") || "");

  if (!id) {
    return { success: false, error: "Teacher ID missing" };
  }

  try {
    try {
      await clerkAdmin.users.deleteUser(id);
    } catch (err: any) {
      if (err?.status !== 404) throw err;
    }

    await prisma.teacher.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteTeacher error:", error);
    return {
      success: false,
      error: "Failed to delete teacher",
    };
  }
};

// StudentForm
export const createStudent = async (
  _prevState: ActionState,
  data: StudentFormValues,
): Promise<ActionState> => {
  try {
    /* ================= PHONE UNIQUENESS ================= */
    if (data.phone) {
      const existingPhone = await prisma.student.findFirst({
        where: { phone: data.phone },
      });

      if (existingPhone) {
        return {
          success: false,
          error: "A student with this phone number already exists",
        };
      }
    }

    /* ================= ACADEMIC YEAR ================= */
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!academicYear) {
      return {
        success: false,
        error: "No active academic year found",
      };
    }

    /* ================= CLASS CAPACITY ================= */
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity <= classItem._count.students) {
      return {
        success: false,
        error: "Class capacity is already full",
      };
    }

    /* ================= CLERK USER ================= */
    const user = await clerkAdmin.users.createUser({
      username: data.username,
      password: data.password || undefined,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

    /* ================= PRISMA CREATE ================= */
    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,

        class: {
          connect: { id: data.classId },
        },

        parent: {
          connect: { id: data.parentId },
        },

        academicYear: {
          connect: { id: academicYear.id },
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("createStudent error:", error);
    return {
      success: false,
      error: error?.errors?.[0]?.message ?? "Failed to create student",
    };
  }
};

export const updateStudent = async (
  _prevState: ActionState,
  data: StudentFormValues,
): Promise<ActionState> => {
  if (!data.id) {
    return { success: false, error: "Student ID missing" };
  }

  try {
    await clerkAdmin.users.updateUser(data.id, {
      username: data.username,
      ...(data.password ? { password: data.password } : {}),
      firstName: data.name,
      lastName: data.surname,
    });

    const studentData: Prisma.StudentUpdateInput = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      class: { connect: { id: data.classId } },
      parent: { connect: { id: data.parentId } },
    };

    if (data.birthday) {
      studentData.birthday = data.birthday;
    }

    await prisma.student.update({
      where: { id: data.id },
      data: studentData,
    });

    return { success: true };
  } catch (error) {
    console.error("updateStudent error:", error);
    return {
      success: false,
      error: "Failed to update student",
    };
  }
};

export const deleteStudent = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const id = String(formData.get("id") || "");

  if (!id) {
    return { success: false, error: "Student ID missing" };
  }

  try {
    await clerkAdmin.users.deleteUser(id);
    await prisma.student.delete({ where: { id } });

    return { success: true };
  } catch (error) {
    console.error("deleteStudent error:", error);
    return {
      success: false,
      error: "Failed to delete student",
    };
  }
};

// ParentForm
export async function createParent(
  _prevState: ActionState,
  data: ParentFormValues,
): Promise<ActionState> {
  try {
    await prisma.parent.create({
      data: {
        id: crypto.randomUUID(),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create Parent Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to create parent",
    };
  }
}

export async function updateParent(
  _prevState: ActionState,
  data: ParentFormValues,
): Promise<ActionState> {
  if (!data.id) {
    return { success: false, error: "Parent ID is required" };
  }

  try {
    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Parent Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to update parent",
    };
  }
}

export async function deleteParent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") || "");

  if (!id) {
    return { success: false, error: "Parent ID missing" };
  }

  try {
    await prisma.parent.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Parent Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to delete parent",
    };
  }
}

// ExamForm
export async function createExam(
  _prevState: ActionState,
  data: ExamFormValues,
): Promise<ActionState> {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create Exam Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to create exam",
    };
  }
}

export async function updateExam(
  _prevState: ActionState,
  data: ExamFormValues,
): Promise<ActionState> {
  if (!data.id) {
    return { success: false, error: "Exam ID is required" };
  }

  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Exam Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to update exam",
    };
  }
}

export async function deleteExam(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));

  if (!id) {
    return { success: false, error: "Exam ID missing" };
  }

  try {
    await prisma.exam.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Exam Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to delete exam",
    };
  }
}

// AssignmentForm
export async function createAssignment(
  _prevState: ActionState,
  data: AssignmentFormValues,
): Promise<ActionState> {
  try {
    const { id, ...createData } = data;

    await prisma.assignment.create({
      data: createData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create Assignment Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to create assignment",
    };
  }
}

export async function updateAssignment(
  _prevState: ActionState,
  data: AssignmentFormValues,
): Promise<ActionState> {
  if (!data.id) {
    return { success: false, error: "Assignment ID is required" };
  }

  try {
    const { id, ...updateData } = data;

    await prisma.assignment.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Assignment Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to update assignment",
    };
  }
}

export async function deleteAssignment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: "Invalid assignment ID" };
  }

  try {
    await prisma.assignment.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Assignment Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to delete assignment",
    };
  }
}

// Results
export async function createResult(
  _prevState: ActionState,
  data: ResultFormValues,
): Promise<ActionState> {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId ?? null,
        assignmentId: data.assignmentId ?? null,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create Result Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to create result",
    };
  }
}

export async function updateResult(
  _prevState: ActionState,
  data: ResultFormValues,
): Promise<ActionState> {
  if (!data.id) {
    return { success: false, error: "Result ID is required" };
  }

  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId ?? null,
        assignmentId: data.assignmentId ?? null,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Result Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to update result",
    };
  }
}

export async function deleteResult(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: "Invalid result ID" };
  }

  try {
    await prisma.result.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Result Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to delete result",
    };
  }
}

// Attendance
export async function createAttendance(
  _prevState: ActionState,
  data: AttendanceFormInput,
): Promise<ActionState> {
  try {
    const parsed = attendanceSchema.parse(data);

    const { id, ...createData } = parsed;

    await prisma.attendance.create({
      data: createData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create Attendance Error:", error);
    return {
      success: false,
      error: error?.message ?? "Failed to create attendance",
    };
  }
}

export async function updateAttendance(
  _prevState: ActionState,
  data: AttendanceFormInput,
): Promise<ActionState> {
  try {
    const parsed = attendanceSchema.parse(data);

    if (!parsed.id) {
      return { success: false, error: "Attendance ID is required" };
    }

    const { id, ...updateData } = parsed;

    await prisma.attendance.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Attendance Error:", error);
    return {
      success: false,
      error: error?.message ?? "Failed to update attendance",
    };
  }
}

export async function deleteAttendance(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = Number(formData.get("id"));

  if (!id || Number.isNaN(id)) {
    return { success: false, error: "Invalid attendance ID" };
  }

  try {
    await prisma.attendance.delete({
      where: { id },
    });

    revalidatePath("/list/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Attendance Error:", error);
    return {
      success: false,
      error: error.message ?? "Failed to delete attendance",
    };
  }
}

// FeeForm
export async function createFee(_prevState: ActionState, data: FeeSchemaType) {
  try {
    await prisma.feeStructure.create({
      data: {
        title: data.title, // ✅ correct
        amount: data.amount,
        classId: data.classId ?? null, // ✅ optional
        type: data.type, // ✅ required by schema
        term: data.term ?? null, // ✅ optional
        isActive: true,
      },
    });

    return { success: true, error: false };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
}

export async function updateFee(
  _prevState: ActionState,
  data: FeeSchemaType & { id: number },
) {
  try {
    await prisma.feeStructure.update({
      where: { id: data.id },
      data: {
        title: data.title,
        amount: data.amount,
        classId: data.classId ?? null,
        type: data.type,
        term: data.term ?? null,
        isActive: data.isActive ?? true,
      },
    });

    return { success: true, error: false };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
}

export async function deleteFee(_prevState: ActionState, formData: FormData) {
  const id = Number(formData.get("id"));
  try {
    await prisma.feeStructure.delete({ where: { id } });
    return { success: true, error: false };
  } catch {
    return { success: false, error: true };
  }
}

// AssignFee
export async function assignFeeAction(
  _prev: { success: boolean; error?: string },
  input: AssignFeeValues,
) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const { assignmentType, classId, studentId, feeStructureId } = input;

    const fee = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      select: { amount: true },
    });

    if (!fee) {
      return { success: false, error: "Fee structure not found" };
    }

    if (assignmentType === "CLASS") {
      const students = await prisma.student.findMany({
        where: { classId: classId! },
        select: { id: true },
      });

      if (students.length === 0) {
        return { success: false, error: "No students found in this class" };
      }

      await prisma.studentFee.createMany({
        data: students.map((s) => ({
          studentId: s.id,
          feeStructureId,
          totalAmount: fee.amount,
          paidAmount: 0,
          status: FeeStatus.PENDING,
        })),
        skipDuplicates: true,
      });
    } else {
      await prisma.studentFee.create({
        data: {
          studentId: studentId!,
          feeStructureId,
          totalAmount: fee.amount,
          paidAmount: 0,
          status: FeeStatus.PENDING,
        },
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Assign Fee Error:", err);
    return { success: false, error: "Failed to assign fee" };
  }
}

// Payment
export async function collectPaymentAction(input: {
  studentFeeId: number;
  amount: number;
  mode: PaymentMode;
  referenceId?: string;
}) {
  try {
    const { studentFeeId, amount, mode, referenceId } = input;

    // Create payment
    await prisma.payment.create({
      data: {
        studentFeeId,
        amount,
        mode,
        referenceId,
      },
    });

    // Recalculate totals
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: { payments: true },
    });

    if (!studentFee) {
      return { error: "Fee assignment not found" };
    }

    const totalPaid = studentFee.payments.reduce((sum, p) => sum + p.amount, 0);

    let status: FeeStatus = "PENDING";
    if (totalPaid >= studentFee.totalAmount) {
      status = "PAID";
    } else if (totalPaid > 0) {
      status = "PARTIAL";
    }

    await prisma.studentFee.update({
      where: { id: studentFeeId },
      data: {
        paidAmount: totalPaid,
        status,
      },
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to collect payment" };
  }
}

// AnnouncementForm
export const createAnnouncement = async (
  _prev: ActionState,
  data: AnnouncementFormValues,
): Promise<ActionState> => {
  try {
    const createData: AnnouncementCreateData = {
      title: data.title,
      description: data.description,
      date: data.date,
      classId:
        data.classId && data.classId !== "ALL" ? Number(data.classId) : null,
    };

    await prisma.announcement.create({
      data: createData, // ✅ id removed, classId fixed
    });

    return { success: true };
  } catch (err) {
    console.error("❌ createAnnouncement:", err);
    return {
      success: false,
      error: "Failed to create announcement",
    };
  }
};

export const updateAnnouncement = async (
  _prev: ActionState,
  data: AnnouncementFormValues,
): Promise<ActionState> => {
  try {
    const updateData = {
      title: data.title,
      description: data.description,
      date: data.date,
      classId:
        data.classId && data.classId !== "ALL" ? Number(data.classId) : null,
    };

    await prisma.announcement.update({
      where: { id: data.id! }, // ✅ id only here
      data: updateData,
    });

    return { success: true };
  } catch (err) {
    console.error("❌ updateAnnouncement:", err);
    return {
      success: false,
      error: "Failed to update announcement",
    };
  }
};

export const deleteAnnouncement = async (
  _prevState: ActionState,
  formData: FormData,
) => {
  try {
    const id = Number(formData.get("id"));

    await prisma.announcement.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("❌ deleteAnnouncement error:", err);
    return { success: false, error: true };
  }
};

// EventForm
export async function createEvent(
  _prevState: ActionState,
  data: EventFormInput,
): Promise<ActionState> {
  try {
    const parsed = eventSchema.parse(data);

    const { id, ...createData } = parsed;

    await prisma.event.create({
      data: {
        ...createData,
        classId: createData.classId ?? null,
        category: createData.category ?? "default",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Create Event Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateEvent(
  _prevState: ActionState,
  data: EventFormInput,
): Promise<ActionState> {
  try {
    const parsed = eventSchema.parse(data);

    if (!parsed.id) {
      return { success: false, error: "Event ID is required" };
    }

    const { id, ...updateData } = parsed;

    await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        classId: updateData.classId ?? null,
        category: updateData.category ?? "default",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Event Error:", error);
    return { success: false, error: error.message };
  }
}

export const deleteEvent = async (_prevState: ActionState, data: FormData) => {
  try {
    const id = Number(data.get("id"));

    if (!id || Number.isNaN(id)) {
      throw new Error("Invalid event ID");
    }

    await prisma.event.delete({
      where: { id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("Delete Event Error:", err);
    return { success: false, error: true };
  }
};

// HolidayForm
type CreateHolidayInput = {
  title: string;
  date: Date;
  isFullDay: boolean;
};

type UpdateHolidayInput = CreateHolidayInput & {
  id: number;
};

export async function createHoliday(
  _prev: ActionState,
  data: CreateHolidayInput,
): Promise<ActionState> {
  try {
    await prisma.holiday.create({
      data: {
        title: data.title,
        date: data.date,
        isFullDay: data.isFullDay,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("❌ createHoliday:", err);
    return {
      success: false,
      error: "Failed to create holiday",
    };
  }
}

export async function updateHoliday(
  _prev: ActionState,
  data: UpdateHolidayInput,
): Promise<ActionState> {
  try {
    await prisma.holiday.update({
      where: { id: data.id },
      data: {
        title: data.title,
        date: data.date,
        isFullDay: data.isFullDay,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("❌ updateHoliday:", err);
    return {
      success: false,
      error: "Failed to update holiday",
    };
  }
}

export const deleteHoliday = async (_: any, formData: FormData) => {
  const rawId = formData.get("id");
  const id = Number(rawId);

  if (!id || Number.isNaN(id)) {
    return { success: false, error: "Invalid holiday id" };
  }

  await prisma.holiday.deleteMany({
    where: { id },
  });

  return { success: true, error: false };
};

// Other Internal things
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function updateAdminProfile(_: any, formData: FormData) {
  try {
    const id = String(formData.get("id"));
    const username = String(formData.get("username"));

    let img: string | undefined;
    const file = formData.get("image") as File | null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop();
      const fileName = `admin-${id}-${Date.now()}.${ext}`;

      const uploadDir = await ensureUploadDir();
      const uploadPath = path.join(uploadDir, fileName);

      await writeFile(uploadPath, buffer);
      img = `/uploads/${fileName}`;
    }

    await prisma.admin.update({
      where: { id },
      data: {
        username,
        ...(img && { img }),
      },
    });

    revalidatePath("/list/profile");
    return { success: true };
  } catch (error) {
    console.error("ADMIN PROFILE UPDATE ERROR:", error);
    return { success: false, error: true };
  }
}

export async function updateTeacherProfile(_: any, formData: FormData) {
  try {
    const id = String(formData.get("id"));
    const name = String(formData.get("name"));
    const surname = String(formData.get("surname"));
    const phone = String(formData.get("phone") || "");

    let img: string | undefined;
    const file = formData.get("image") as File | null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop();
      const fileName = `teacher-${id}-${Date.now()}.${ext}`;

      const uploadDir = await ensureUploadDir();
      const uploadPath = path.join(uploadDir, fileName);

      await writeFile(uploadPath, buffer);
      img = `/uploads/${fileName}`;
    }

    await prisma.teacher.update({
      where: { id },
      data: {
        name,
        surname,
        phone,
        ...(img && { img }),
      },
    });

    revalidatePath("/list/profile");
    return { success: true };
  } catch (error) {
    console.error("TEACHER PROFILE UPDATE ERROR:", error);
    return { success: false, error: true };
  }
}

export async function uploadAvatar(formData: FormData) {
  try {
    const id = String(formData.get("id"));
    const file = formData.get("image") as File | null;

    if (!file || file.size === 0) return;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop();
    const fileName = `admin-${id}-${Date.now()}.${ext}`;

    const uploadDir = await ensureUploadDir();
    await writeFile(path.join(uploadDir, fileName), buffer);

    await prisma.admin.update({
      where: { id },
      data: { img: `/uploads/${fileName}` },
    });

    revalidatePath("/list/profile");
  } catch (error) {
    console.error("AVATAR UPLOAD ERROR:", error);
  }
}

export async function updateAdminLastActive(userId: string) {
  try {
    await prisma.admin.upsert({
      where: { id: userId },
      update: {
        lastActiveAt: new Date(),
      },
      create: {
        id: userId,
        username: "admin",
        lastActiveAt: new Date(),
      },
    });
  } catch (error) {
    console.error("LAST ACTIVE UPDATE FAILED:", error);
  }
}
