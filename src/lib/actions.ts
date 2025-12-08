"use server";

import prisma from "./prisma";
import { clerkAdmin } from "./clerkAdmin";
import { auth } from "@clerk/nextjs/server";
import { assignFeeSchema } from "@/lib/formValidationSchemas";
import { PaymentMode, FeeStatus } from "@prisma/client";
import { AnnouncementSchema, AssignmentSchema, attendanceSchema, AttendanceSchema, ClassSchema, EventSchema, ExamSchema, FeeSchemaType, LessonSchema, ParentSchema, ResultSchema, StudentSchema, SubjectSchema, TeacherSchema } from "./formValidationSchemas";

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema 
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkAdmin.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
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
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err: any) {
    console.error("❌ Clerk createUser failed:", err);
    if (err.errors) {
      for (const e of err.errors) {
        console.error(`🔍 ${e.meta?.paramName}: ${e.message}`);
      }
    }
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkAdmin.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
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
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// src/lib/actions.ts (replace only the deleteTeacher export)
export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const idRaw = data.get("id");
  const id = idRaw ? String(idRaw) : null;

  if (!id) {
    console.error("deleteTeacher: missing id in FormData");
    return { success: false, error: true };
  }

  try {
    // Try to delete Clerk user first. If Clerk returns 404, we'll log and continue.
    try {
      await clerkAdmin.users.deleteUser(id);
      console.log(`✅ Clerk user deleted: ${id}`);
    } catch (clerkErr: any) {
      // Clerk API returns a struct with status/code for not-found
      const isNotFound =
        clerkErr?.status === 404 ||
        clerkErr?.code === "api_response_error" && clerkErr?.status === 404 ||
        (Array.isArray(clerkErr?.errors) && clerkErr.errors.some((e: any) => e.status === 404));

      if (isNotFound) {
        console.warn(`⚠️ Clerk user not found (already deleted?): ${id} — continuing to remove DB record`);
      } else {
        // For other errors rethrow so we can handle/inspect them
        console.error("❌ Clerk deleteUser failed:", clerkErr);
        throw clerkErr;
      }
    }

    // Now delete from Prisma. If prisma delete fails, it's likely DB/data issue.
    await prisma.teacher.delete({
      where: { id },
    });

    console.log(`✅ Prisma teacher record deleted: ${id}`);
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteTeacher: failed:", err);
    return { success: false, error: true };
  }
};

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  console.log(data);
  try {
    const existingPhone = await prisma.student.findUnique({
      where: { phone: data.phone || undefined },
    });

    if (existingPhone) {
      console.warn(`⚠️ Student with phone ${data.phone} already exists.`);
      return { success: false, error: true };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkAdmin.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" },
    });

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
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
    } catch (err: any) {
    if (err.clerkError && err.errors) {
      console.error("🔍 Clerk Validation Errors:");
      for (const e of err.errors) {
        console.error(`- ${e.message}`);
      }
    } else {
      console.error(err);
    }
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkAdmin.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
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
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkAdmin.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createLesson = async (
  currentState: { success: boolean; error: boolean },
  data: LessonSchema
) => {
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

    // revalidatePath("/list/lessons"); // uncomment if you use revalidatePath
    return { success: true, error: false };
  } catch (err) {
    console.error("createLesson error:", err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: { success: boolean; error: boolean },
  data: LessonSchema
) => {
  if (!data.id) return { success: false, error: true };

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

    // revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateLesson error:", err);
    return { success: false, error: true };
  }
};

// DELETE LESSON
export async function deleteLesson(
  prevState: any,
  formData: FormData
) {
  try {
    const id = Number(formData.get("id"));
    if (!id) return { success: false, error: "Lesson ID missing" };

    await prisma.lesson.delete({
      where: { id },
    });

    return { success: true };
  } catch (err) {
    console.error("deleteLesson error:", err);
    return { success: false, error: true };
  }
}

export const createAssignment = async (currentState: CurrentState, data: AssignmentSchema) => {
  try {
    await prisma.assignment.create({ data });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (currentState: CurrentState, data: AssignmentSchema) => {
  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data,
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.assignment.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        studentId: data.studentId,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));
  try {
    await prisma.result.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
        category: data.category || "default",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
        category: data.category || "default",
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = Number(data.get("id"));
  try {
    await prisma.event.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("❌ createAnnouncement error:", err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: { id: data.id! },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log("❌ updateAnnouncement error:", err);
    return { success: false, error: true };
  }
};

// DELETE
export const deleteAnnouncement = async (
  currentState: CurrentState,
  formData: FormData
) => {
  try {
    const id = Number(formData.get("id"));

    await prisma.announcement.delete({
      where: { id }
    });

    return { success: true, error: false };

  } catch (err) {
    console.log("❌ deleteAnnouncement error:", err);
    return { success: false, error: true };
  }
};

export async function createAttendance(formData: AttendanceSchema) {
  try {
    const validated = attendanceSchema.parse(formData);

    await prisma.attendance.create({
      data: {
        studentId: validated.studentId,
        lessonId: validated.lessonId,
        date: validated.date,
        present: validated.present,
      },
    });

    // revalidatePath("/list/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Create Attendance Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAttendance(formData: AttendanceSchema) {
  try {
    const validated = attendanceSchema.parse(formData);

    await prisma.attendance.update({
      where: { id: validated.id },
      data: {
        studentId: validated.studentId,
        lessonId: validated.lessonId,
        date: validated.date,
        present: validated.present,
      },
    });

    // revalidatePath("/list/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Update Attendance Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteAttendance(_: any, formData: FormData) {
  try {
    const id = Number(formData.get("id"));

    await prisma.attendance.delete({
      where: { id },
    });

    // revalidatePath("/list/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Attendance Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createParent(_: any, data: ParentSchema) {
  try {
    await prisma.parent.create({
      data: {
        id: crypto.randomUUID(),   // generate valid parentId
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateParent(_: any, data: ParentSchema) {
  try {
    if (!data.id) {
      return { success: false, error: "Parent ID is required for update" };
    }

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

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Update Parent Error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteParent(_: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;

    await prisma.parent.delete({
      where: { id }
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.error("Delete Parent Error:", err);
    return { success: false, error: err.message };
  }
}

type State = { success: boolean; error: boolean };

export async function createFee(_: State, data: FeeSchemaType) {
  try {
    await prisma.feeStructure.create({
      data: {
        title: data.title,              // ✅ correct
        amount: data.amount,
        classId: data.classId ?? null,  // ✅ optional
        type: data.type,                // ✅ required by schema
        term: data.term ?? null,        // ✅ optional
        isActive: true,
      },
    });

    return { success: true, error: false };
  } catch (e) {
    console.error(e);
    return { success: false, error: true };
  }
}

export async function updateFee(_: State, data: FeeSchemaType & { id: number }) {
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

export async function deleteFee(_: State, formData: FormData) {
  const id = Number(formData.get("id"));
  try {
    await prisma.feeStructure.delete({ where: { id } });
    return { success: true, error: false };
  } catch {
    return { success: false, error: true };
  }
}

export async function assignFeeAction(input: unknown) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const parsed = assignFeeSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { assignmentType, classId, studentId, feeStructureId } = parsed.data;

  const fee = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
    select: { amount: true },
  });

  if (!fee) return { error: "Fee structure not found" };

  if (assignmentType === "CLASS") {
    const students = await prisma.student.findMany({
      where: { classId: classId! },
      select: { id: true },
    });

    if (students.length === 0) {
      return { error: "No students found in this class" };
    }

    await prisma.studentFee.createMany({
      data: students.map((s) => ({
        studentId: s.id,
        feeStructureId,
        totalAmount: fee.amount,
        paidAmount: 0,
        status: FeeStatus.PENDING,
      })),
      skipDuplicates: true, // ✅ critical
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
}

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

    const totalPaid = studentFee.payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

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

