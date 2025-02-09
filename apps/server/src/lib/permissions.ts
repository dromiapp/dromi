import { prisma, type User, type Resource, PermissionFlag } from "@repo/db";

type PermissionCheck = {
	workspaceId: string;
	userId: string;
	required: {
		resource: Resource;
		flag: PermissionFlag;
	}[];
	requireOwner?: boolean;
};

type PermissionResult = {
	hasPermission: boolean;
	flags: {
		resource: Resource;
		flags: number;
	}[];
};

export async function checkWorkspacePermission({
	workspaceId,
	userId,
	required,
	requireOwner = false,
}: PermissionCheck): Promise<PermissionResult> {
	const member = await prisma.workspaceMember.findFirst({
		where: {
			workspaceId,
			userId,
			...(requireOwner ? { isOwner: true } : {}),
		},
		include: {
			permissions: true,
		},
	});

	if (!member) {
		return {
			hasPermission: false,
			flags: [],
		};
	}

	if (member.isOwner)
		return {
			hasPermission: true,
			flags: member.permissions.map((p) => ({
				resource: p.resource,
				flags: p.flags,
			})),
		};

	const hasPermission = required.every(({ resource, flag }) => {
		const permission = member.permissions.find((p) => p.resource === resource);
		return permission ? (permission.flags & Number(flag)) !== 0 : false;
	});

	return {
		hasPermission,
		flags: member.permissions.map((p) => ({
			resource: p.resource,
			flags: p.flags,
		})),
	};
}

export function getPermissionFlags(flags: number): PermissionFlag[] {
	return Object.values(PermissionFlag)
		.filter((flag) => typeof flag === "number")
		.filter((flag) => (flags & flag) !== 0) as PermissionFlag[];
}
