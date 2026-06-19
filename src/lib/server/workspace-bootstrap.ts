import { PlanTier, ProjectStatus, SubscriptionStatus, TaskStatus, type MembershipRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'chronos-workspace'
}

async function uniqueWorkspaceSlug(base: string) {
  let candidate = slugify(base)
  let suffix = 1

  while (await prisma.workspace.findUnique({ where: { slug: candidate } })) {
    suffix += 1
    candidate = `${slugify(base)}-${suffix}`
  }

  return candidate
}

export async function bootstrapWorkspaceAccount(input: {
  name: string
  email: string
  password: string
  workspaceName?: string
  role?: MembershipRole
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (existing) {
    throw new Error('An account with this email already exists.')
  }

  const workspaceName = input.workspaceName?.trim() || `${input.name.split(' ')[0]}'s Workspace`
  const workspaceSlug = await uniqueWorkspaceSlug(workspaceName)
  const passwordHash = await hashPassword(input.password)

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        passwordHash,
      },
    })

    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
        plan: PlanTier.STARTER,
      },
    })

    const membership = await tx.membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: input.role ?? 'OWNER',
      },
    })

    const project = await tx.workspaceProject.create({
      data: {
        workspaceId: workspace.id,
        name: 'Chronos Launch',
        description: 'Initial product launch roadmap and operating timeline.',
        color: '#2563eb',
        status: ProjectStatus.ACTIVE,
      },
    })

    const timeline = await tx.workspaceTimeline.create({
      data: {
        projectId: project.id,
        name: 'Go-to-market runway',
        description: 'Plan the first 90 days of customer-facing launch work.',
      },
    })

    await tx.workspaceNode.createMany({
      data: [
        {
          timelineId: timeline.id,
          title: 'Position product narrative',
          description: 'Clarify the story Chronos tells for teams and operators.',
          status: TaskStatus.IN_PROGRESS,
          priority: 'high',
        },
        {
          timelineId: timeline.id,
          title: 'Invite design partners',
          description: 'Line up early teams for feedback and onboarding.',
          status: TaskStatus.TODO,
          priority: 'high',
        },
        {
          timelineId: timeline.id,
          title: 'Publish pricing page',
          description: 'Ship a credible SaaS monetization story.',
          status: TaskStatus.TODO,
          priority: 'medium',
        },
      ],
    })

    await tx.subscription.create({
      data: {
        workspaceId: workspace.id,
        plan: PlanTier.STARTER,
        status: SubscriptionStatus.TRIALING,
      },
    })

    await tx.auditLog.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        action: 'workspace.bootstrap',
        targetType: 'workspace',
        targetId: workspace.id,
        metadata: JSON.stringify({ source: 'signup' }),
      },
    })

    return { user, workspace, membership }
  })

  return result
}
