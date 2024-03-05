import { TRPCError } from "@trpc/server";
import moment from "moment";
import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserByEmail: protectedProcedure.input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (user) {
        return user;
      }
      else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),
  getPatientDetails: protectedProcedure.input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "doctor" && ctx.session.user.id !== input.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      const patient = await ctx.db.patient.findUnique({
        where: { userId: input.userId },
        include: { User: true }
      });
      if (patient) {
        return patient;
      }
      else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }
    }),
  getDoctors: protectedProcedure.query(async ({ ctx }) => {
    const doctors = await ctx.db.doctor.findMany({
      include: { User: true }
    });
    return doctors;
  }),
  getPatients: protectedProcedure.query(async ({ ctx }) => {
    const patients = await ctx.db.patient.findMany({
      include: { User: true }
    });
    return patients;
  }),
  setDoctor: protectedProcedure.input(z.object({
    department: z.string(), position: z.string()
  })).mutation(async ({ ctx, input }) => {
    const doctor = await ctx.db.doctor.create({
      data: {
        userId: ctx.session.user.id, department: input.department, position: input.position
      }
    });
    const user = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: 'doctor', doctorId: doctor.id }
    });
    if (user) {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        await ctx.db.room.create({
          data: {
            title: "Test Session",
            content: "This is a test session",
            User_CreatedBy: { connect: { id: ctx.session.user.id } },
            duration: 1,
            time: moment().utc().add(10, 'day').toDate(),
            User_CreatedFor: { connect: { email: 'test@test.com' } },
          },
        });
      }
      return { user, doctor };
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),
  setPatient: protectedProcedure.input(z.object({
    height: z.number(),
    weight: z.number(),
    bloodType: z.string(),
    allergies: z.string(),
    medications: z.string(),
    DOB: z.date(),
  })).mutation(async ({ ctx, input }) => {
    const patient = await ctx.db.patient.create({
      data: {
        userId: ctx.session.user.id, height: input.height, weight: input.weight,
        bloodType: input.bloodType, allergies: input.allergies,
        medications: input.medications, DOB: input.DOB
      }
    });
    const user = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: 'patient', patientId: patient.id }
    });
    if (user) {
      if (env.NEXT_PUBLIC_TESTMODE === "TESTING") {
        await ctx.db.room.create({
          data: {
            title: "Test Session",
            content: "This is a test session",
            User_CreatedBy: { connect: { id: ctx.session.user.id } },
            duration: 1,
            time: moment().utc().add(10, 'day').toDate(),
            User_CreatedFor: { connect: { email: 'test@test.com' } },
          },
        });
      }
      return { user, patient };
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),
  setDemo: protectedProcedure.input(z.object({
    department: z.string(),
    position: z.string(),
    height: z.number(),
    weight: z.number(),
    bloodType: z.string(),
    allergies: z.string(),
    medications: z.string(),
    DOB: z.date(),
  })).mutation(async ({ ctx, input }) => {
    if (env.NEXT_PUBLIC_TESTMODE !== "TESTING") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Demo mode is disabled",
      });
    }
    const doctor = await ctx.db.doctor.create({
      data: {
        userId: ctx.session.user.id, department: input.department, position: input.position
      }
    });
    const patient = await ctx.db.patient.create({
      data: {
        userId: ctx.session.user.id, height: input.height, weight: input.weight,
        bloodType: input.bloodType, allergies: input.allergies,
        medications: input.medications, DOB: input.DOB
      }
    });
    const user = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: 'doctor', patientId: patient.id, doctorId: doctor.id }
    });
    if (user) {
      await ctx.db.room.create({
        data: {
          title: "Test Session",
          content: "This is a test session",
          User_CreatedBy: { connect: { id: ctx.session.user.id } },
          duration: 1,
          time: moment().utc().add(10, 'day').toDate(),
          User_CreatedFor: { connect: { email: 'test@test.com' } },
        },
      });
      return { user, patient };
    }
    else {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
  }),
  toggleRole: protectedProcedure.mutation(async ({ ctx, }) => {
    if (env.NEXT_PUBLIC_TESTMODE !== "TESTING") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Demo mode is disabled",
      });
    }
    const user = await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: ctx.session.user.role === "doctor" ? "patient" : "doctor" }
    });
  }),
});
