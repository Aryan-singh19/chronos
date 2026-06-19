import { PlanTier, SubscriptionStatus, TaskStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function formatPlan(plan: PlanTier) {
  switch (plan) {
    case 'ENTERPRISE':
      return 'Enterprise'
    case 'GROWTH':
      return 'Growth'
    default:
      return 'Starter'
  }
}

export async function getWorkspaceOverview(workspaceId: string) {
  const [workspace, projectCount, timelineCount, doneCount, inProgressCount, memberCount, invitations] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: true },
    }),
    prisma.workspaceProject.count({ where: { workspaceId } }),
    prisma.workspaceTimeline.count({ where: { project: { workspaceId } } }),
    prisma.workspaceNode.count({ where: { timeline: { project: { workspaceId } }, status: TaskStatus.DONE } }),
    prisma.workspaceNode.count({ where: { timeline: { project: { workspaceId } }, status: TaskStatus.IN_PROGRESS } }),
    prisma.membership.count({ where: { workspaceId, status: 'ACTIVE' } }),
    prisma.invitation.count({ where: { workspaceId, acceptedAt: null } }),
  ])

  if (!workspace) return null

  return {
    workspace,
    planLabel: formatPlan(workspace.plan),
    billingStatus: workspace.subscription?.status ?? SubscriptionStatus.TRIALING,
    metrics: [
      { label: 'Projects', value: String(projectCount), change: `${timelineCount} timelines mapped` },
      { label: 'Active members', value: String(memberCount), change: `${invitations} invite${invitations === 1 ? '' : 's'} pending` },
      { label: 'Completed tasks', value: String(doneCount), change: `${inProgressCount} in progress` },
      { label: 'Plan tier', value: formatPlan(workspace.plan), change: workspace.subscription?.status ?? 'trialing' },
    ],
  }
}

export async function getWorkspaceTeam(workspaceId: string) {
  return prisma.membership.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })
}

export async function getWorkspaceBilling(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      subscription: true,
      auditLogs: {
        where: { action: { in: ['billing.checkout', 'workspace.bootstrap', 'team.invite'] } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      },
    },
  })

  if (!workspace) return null

  return {
    workspace,
    currentPlan: formatPlan(workspace.plan),
    invoices: workspace.auditLogs.map((log, index) => ({
      id: log.id,
      label:
        log.action === 'workspace.bootstrap'
          ? 'Workspace created'
          : log.action === 'team.invite'
            ? 'Seat expansion event'
            : 'Checkout activity',
      amount: log.action === 'team.invite' ? '$19.00' : index === 0 ? '$79.00' : '$0.00',
      issuedOn: log.createdAt.toISOString().slice(0, 10),
    })),
  }
}
