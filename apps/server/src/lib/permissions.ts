import { type Resource, type User, permissionFlag, prisma } from "@repo/db";

type PermissionCheck = {
	workspaceId: string;
	userId: string;
	required: {
		resource: Resource;
		flag: permissionFlag;
		resourceId?: string;
		checkWorkspacePermission?: boolean;
	}[];
	requireOwner?: boolean;
};

type PermissionResult = {
	hasPermission: boolean;
	flags: {
		resource: Resource;
		flags: number;
		resourceId: string | null;
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
				resourceId: p.resourceId,
			})),
		};

	const hasPermission = required.every(
		({ resource, flag, resourceId, checkWorkspacePermission = true }) => {
			const specificPermission = resourceId
				? member.permissions.find(
						(p) => p.resource === resource && p.resourceId === resourceId,
					)
				: null;

			if (
				specificPermission &&
				(specificPermission.flags & Number(flag)) !== 0
			) {
				return true;
			}

			if (checkWorkspacePermission) {
				const workspacePermission = member.permissions.find(
					(p) => p.resource === resource && p.resourceId === null,
				);
				if (
					workspacePermission &&
					(workspacePermission.flags & Number(flag)) !== 0
				) {
					return true;
				}
			}

			return false;
		},
	);

	return {
		hasPermission,
		flags: member.permissions.map((p) => ({
			resource: p.resource,
			flags: p.flags,
			resourceId: p.resourceId,
		})),
	};
}

export function getPermissionFlags(flags: number): permissionFlag[] {
	return Object.values(permissionFlag)
		.filter((flag) => typeof flag === "number")
		.filter((flag) => (flags & flag) !== 0) as permissionFlag[];
}
