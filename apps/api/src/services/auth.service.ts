import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middlewares/error';
import { hashPassword, comparePassword } from '../utils/password';
import { issueTokenPair } from '../utils/jwt';
import { sanitizeCpf } from '../utils/cpf';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

/** Remove campos sensíveis antes de devolver o usuário ao cliente. */
export function publicUser(user: User) {
  const { password: _password, ...rest } = user;
  return rest;
}

function authTokens(user: User) {
  return issueTokenPair({ sub: user.id, username: user.username });
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const cpf = input.cpf ? sanitizeCpf(input.cpf) : undefined;

  const clash = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username: input.username },
        ...(cpf ? [{ cpf }] : []),
      ],
    },
    select: { email: true, username: true, cpf: true },
  });

  if (clash) {
    if (clash.email === email) throw new AppError(409, 'E-mail já cadastrado');
    if (clash.username === input.username) throw new AppError(409, 'Usuário já em uso');
    throw new AppError(409, 'CPF já cadastrado');
  }

  // O vínculo de superior (árvore Drün/Rhän/Thrän) só é definido após o
  // primeiro checkin/selo — o inviteCode é validado aqui apenas se enviado.
  if (input.inviteCode) {
    const invite = await prisma.inviteLink.findUnique({
      where: { code: input.inviteCode },
    });
    if (!invite || invite.usedBy) {
      throw new AppError(400, 'Link de convite inválido ou já utilizado');
    }
  }

  const user = await prisma.user.create({
    data: {
      username: input.username,
      name: input.name,
      email,
      password: await hashPassword(input.password),
      gender: input.gender,
      birthDate: input.birthDate,
      phone: input.phone,
      cpf,
      city: input.city,
      state: input.state,
      bio: input.bio,
      // Guardado até o 1º checkin/selo disparar o vínculo de superior.
      pendingInviteCode: input.inviteCode ?? null,
    },
  });

  return { user: publicUser(user), tokens: authTokens(user) };
}

export async function login(input: LoginInput) {
  const identifier = input.identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: input.identifier }] },
  });

  if (!user || !(await comparePassword(input.password, user.password))) {
    throw new AppError(401, 'Credenciais inválidas');
  }

  return { user: publicUser(user), tokens: authTokens(user) };
}

export async function refresh(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(401, 'Usuário não encontrado');
  return { tokens: authTokens(user) };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { onboarding: true },
  });
  if (!user) throw new AppError(404, 'Usuário não encontrado');
  const { onboarding, ...rest } = user;
  return { ...publicUser(rest as User), onboarding };
}
