import { PlanTier, PrismaClient, ProjectStatus, SubscriptionStatus, TaskStatus } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'founder@chronos.app').toLowerCase()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'
  const workspaceName = process.env.SEED_WORKSPACE_NAME ?? 'Chronos HQ'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log(`Seed skipped: ${adminEmail} already exists.`)
    return
  }

  const user = await prisma.user.create({
    data: {
      name: 'Chronos Admin',
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
    },
  })

  const workspace = await prisma.workspace.create({
    data: {
      name: workspaceName,
      slug: 'chronos-hq',
      plan: PlanTier.GROWTH,
    },
  })

  await prisma.membership.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'OWNER',
    },
  })

  const project = await prisma.workspaceProject.create({
    data: {
      workspaceId: workspace.id,
      name: 'Production Launch',
      description: 'Deployment, billing, support, and GTM readiness.',
      color: '#0f766e',
      status: ProjectStatus.ACTIVE,
    },
  })

  const timeline = await prisma.workspaceTimeline.create({
    data: {
      projectId: project.id,
      name: 'Launch Week',
      description: 'Everything needed to ship the SaaS publicly.',
    },
  })

  await prisma.workspaceNode.createMany({
    data: [
      {
        timelineId: timeline.id,
        title: 'Connect Vercel production envs',
        description: 'Set DATABASE_URL, AUTH_SECRET, APP_URL, and Stripe keys.',
        status: TaskStatus.TODO,
        priority: 'high',
      },
      {
        timelineId: timeline.id,
        title: 'Create Stripe products and prices',
        description: 'Starter, Growth, and Enterprise recurring plans.',
        status: TaskStatus.TODO,
        priority: 'high',
      },
      {
        timelineId: timeline.id,
        title: 'Invite design partners',
        description: 'Bring first teams into the production workspace.',
        status: TaskStatus.IN_PROGRESS,
        priority: 'medium',
      },
    ],
  })

  await prisma.subscription.create({
    data: {
      workspaceId: workspace.id,
      plan: PlanTier.GROWTH,
      status: SubscriptionStatus.TRIALING,
    },
  })

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      action: 'workspace.seed',
      targetType: 'workspace',
      targetId: workspace.id,
    },
  })

  console.log(`Seed complete for ${adminEmail}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
