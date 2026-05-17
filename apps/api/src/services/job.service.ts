import type { ProfessionalType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { notifySafe } from './notification.service';

export interface PostJobInput {
  role: ProfessionalType;
  title: string;
  description?: string;
  budget?: number;
}

async function loadEventOrganizer(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      organizer: { select: { id: true, userId: true } },
    },
  });
  if (!event) throw new AppError(404, 'Evento não encontrado');
  return event;
}

export async function postJob(
  organizerUserId: string,
  eventId: string,
  input: PostJobInput
) {
  const event = await loadEventOrganizer(eventId);
  if (event.organizer.userId !== organizerUserId) {
    throw new AppError(403, 'Apenas o organizador do evento publica vagas');
  }
  return prisma.jobPosting.create({
    data: {
      eventId,
      organizerId: event.organizer.id,
      role: input.role,
      title: input.title,
      description: input.description,
      budget: input.budget,
    },
  });
}

export async function listOpenJobs() {
  const jobs = await prisma.jobPosting.findMany({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      event: { select: { id: true, name: true, date: true } },
      _count: { select: { applications: true } },
    },
  });
  return jobs.map((j) => ({
    id: j.id,
    role: j.role,
    title: j.title,
    budget: j.budget,
    event: j.event,
    applicationCount: j._count.applications,
  }));
}

export async function listEventJobs(eventId: string) {
  const jobs = await prisma.jobPosting.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true } } },
  });
  return jobs.map((j) => ({
    id: j.id,
    role: j.role,
    title: j.title,
    budget: j.budget,
    status: j.status,
    applicationCount: j._count.applications,
  }));
}

export async function getJob(viewerId: string | null, jobId: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      event: { select: { id: true, name: true } },
      organizer: { select: { userId: true } },
    },
  });
  if (!job) throw new AppError(404, 'Vaga não encontrada');

  const isOrganizer = job.organizer.userId === viewerId;
  const base = {
    id: job.id,
    role: job.role,
    title: job.title,
    description: job.description,
    budget: job.budget,
    status: job.status,
    event: job.event,
    isOrganizer,
    hiredUserId: job.hiredUserId,
  };

  if (isOrganizer) {
    const apps = await prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
    const names = await prisma.user.findMany({
      where: { id: { in: [...new Set(apps.map((a) => a.userId))] } },
      select: { id: true, name: true, username: true },
    });
    const byId = new Map(names.map((u) => [u.id, u]));
    return {
      ...base,
      applications: apps.map((a) => ({
        id: a.id,
        userId: a.userId,
        applicant: byId.get(a.userId) ?? { name: 'Raver', username: '???' },
        message: a.message,
        status: a.status,
      })),
    };
  }

  const mine = viewerId
    ? await prisma.jobApplication.findUnique({
        where: { jobId_userId: { jobId, userId: viewerId } },
        select: { status: true },
      })
    : null;
  return { ...base, myApplicationStatus: mine?.status ?? null };
}

export async function apply(userId: string, jobId: string, message?: string) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: { organizer: { select: { userId: true } }, event: { select: { name: true } } },
  });
  if (!job) throw new AppError(404, 'Vaga não encontrada');
  if (job.status !== 'OPEN') throw new AppError(409, 'Vaga não está aberta');
  if (job.organizer.userId === userId) {
    throw new AppError(400, 'Você não se candidata à própria vaga');
  }
  const exists = await prisma.jobApplication.findUnique({
    where: { jobId_userId: { jobId, userId } },
    select: { id: true },
  });
  if (exists) throw new AppError(409, 'Você já se candidatou a esta vaga');

  const application = await prisma.jobApplication.create({
    data: { jobId, userId, message },
  });

  await notifySafe(job.organizer.userId, {
    type: 'EVENT',
    title: '🧰 Nova candidatura',
    body: `Alguém se candidatou a "${job.title}" (${job.event.name}).`,
    data: { jobId },
  });

  return application;
}

export async function acceptApplication(
  organizerUserId: string,
  applicationId: string
) {
  const application = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          organizer: { select: { userId: true } },
          event: { select: { name: true } },
        },
      },
    },
  });
  if (!application) throw new AppError(404, 'Candidatura não encontrada');
  const { job } = application;
  if (job.organizer.userId !== organizerUserId) {
    throw new AppError(403, 'Apenas o organizador contrata');
  }
  if (job.status !== 'OPEN') {
    throw new AppError(409, 'Esta vaga já foi preenchida ou encerrada');
  }

  await prisma.$transaction([
    prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' },
    }),
    prisma.jobApplication.updateMany({
      where: { jobId: job.id, id: { not: applicationId }, status: 'PENDING' },
      data: { status: 'REJECTED' },
    }),
    prisma.jobPosting.update({
      where: { id: job.id },
      data: { status: 'FILLED', hiredUserId: application.userId },
    }),
  ]);

  await notifySafe(application.userId, {
    type: 'EVENT',
    title: '🎉 Você foi contratado!',
    body: `Fechou para "${job.title}" no ${job.event.name}.`,
    data: { jobId: job.id },
  });

  return { jobId: job.id, hiredUserId: application.userId, status: 'FILLED' };
}
