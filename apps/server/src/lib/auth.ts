import { Algorithm, hash, verify } from "@node-rs/argon2";
import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";
import { prisma } from "@repo/db";
import type { Session, User } from "@repo/db";
import { customAlphabet } from "nanoid";
import { config } from "~/src/config";

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: string,
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const currentDate = Date.now();
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(currentDate + 1000 * 60 * 60 * 24 * 30),
		createdAt: new Date(currentDate),
	};

	await prisma.session.create({
		data: session,
	});

	return session;
}

export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await prisma.session.findUnique({
		where: {
			id: sessionId,
		},
		include: {
			user: true,
		},
	});
	if (result === null) {
		return { session: null, user: null };
	}
	const { user, ...session } = result;
	if (Date.now() >= session.expiresAt.getTime()) {
		await prisma.session.delete({ where: { id: sessionId } });
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await prisma.session.update({
			where: {
				id: session.id,
			},
			data: {
				expiresAt: session.expiresAt,
			},
		});
	}
	const { password, ...userWithoutPassword } = user;
	return { session, user: userWithoutPassword };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await prisma.session.delete({ where: { id: sessionId } });
}

export const nanoid = customAlphabet('123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz', 21)

export function hashPassword(password: string): Promise<string> {
  return hash(password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  })
}

export type SessionValidationResult = {
	session: Session | null;
	user: Omit<User, "password"> | null;
};
