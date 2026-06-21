import { AppShell } from '@/components/layout/AppShell'
import { InviteMemberForm } from '@/components/saas/InviteMemberForm'
import { prisma } from '@/lib/prisma'
import { requireCurrentMembership } from '@/lib/server/auth'
import { getWorkspaceTeam } from '@/lib/server/saas'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const membership = await requireCurrentMembership()
  const [team, invitations] = await Promise.all([
    getWorkspaceTeam(membership.workspaceId),
    prisma.invitation.findMany({
      where: { workspaceId: membership.workspaceId, acceptedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="section-shell surface-panel mb-8 rounded-[32px] p-7">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Team workspace</p>
            <h1 className="mt-1 text-3xl font-bold">Members and invitations</h1>
            <p className="mt-2 text-sm text-[rgb(var(--text-muted))]">
              Invite collaborators, review access, and keep everyone aligned on the right workspace.
            </p>
          </div>

          <InviteMemberForm />

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {team.map((member) => (
              <div key={member.id} className="surface-panel rounded-[28px] p-6">
                <p className="text-xl font-bold">{member.user.name}</p>
                <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{member.user.email}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-[rgb(var(--surface-2))] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[rgb(var(--text-muted))]">
                    {member.role}
                  </span>
                  <span className="text-xs text-[rgb(var(--text-muted))]">
                    {member.status.toLowerCase()}
                  </span>
                </div>
                <p className="mt-4 text-xs text-[rgb(var(--text-muted))]">
                  Joined {member.joinedAt.toDateString()}
                </p>
              </div>
            ))}
          </div>

          <div className="surface-panel mt-8 rounded-[28px] p-6">
            <p className="text-sm font-medium text-[rgb(var(--text-muted))]">Pending invites</p>
            <div className="mt-4 space-y-3">
              {invitations.length === 0 ? (
                <p className="text-sm text-[rgb(var(--text-muted))]">
                  No pending invitations right now. Send one when a teammate is ready to join.
                </p>
              ) : (
                invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[rgba(var(--surface-2),0.92)] px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-[rgb(var(--text-muted))]">Role: {invite.role}</p>
                    </div>
                    <p className="text-xs text-[rgb(var(--text-muted))]">
                      Expires {invite.expiresAt.toDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
