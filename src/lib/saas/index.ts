import type { Project, TimelineNode, RecentItem, Timeline } from '@/types'

export interface SaaSPlan {
  name: string
  priceMonthly: number
  seats: string
  storage: string
  support: string
  highlight?: boolean
}

export interface TeamMemberProfile {
  id: string
  name: string
  role: string
  email: string
  status: 'online' | 'away' | 'offline'
  timezone: string
  focus: string
}

export interface BillingInvoice {
  id: string
  label: string
  amount: string
  status: 'paid' | 'upcoming'
  issuedOn: string
}

export interface WorkspaceMetric {
  label: string
  value: string
  change: string
}

export const SAAS_PLANS: SaaSPlan[] = [
  {
    name: 'Starter',
    priceMonthly: 19,
    seats: 'Up to 3 creators',
    storage: '20 GB encrypted storage',
    support: 'Email support',
  },
  {
    name: 'Growth',
    priceMonthly: 79,
    seats: 'Up to 15 collaborators',
    storage: '250 GB synced storage',
    support: 'Priority support',
    highlight: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 249,
    seats: 'Unlimited seats',
    storage: '2 TB dedicated storage',
    support: 'CSM + onboarding',
  },
]

export const TEAM_MEMBERS: TeamMemberProfile[] = [
  {
    id: 'tm-1',
    name: 'Aryan Singh',
    role: 'Founder / Product',
    email: 'aryan@chronos.app',
    status: 'online',
    timezone: 'IST',
    focus: 'Roadmap and GTM',
  },
  {
    id: 'tm-2',
    name: 'Maya Chen',
    role: 'Customer Success',
    email: 'maya@chronos.app',
    status: 'away',
    timezone: 'SGT',
    focus: 'Onboarding and retention',
  },
  {
    id: 'tm-3',
    name: 'Daniel Brooks',
    role: 'Engineering',
    email: 'daniel@chronos.app',
    status: 'offline',
    timezone: 'PST',
    focus: 'Platform reliability',
  },
]

export const BILLING_INVOICES: BillingInvoice[] = [
  { id: 'inv-1042', label: 'May 2026 subscription', amount: '$79.00', status: 'paid', issuedOn: '2026-05-01' },
  { id: 'inv-1058', label: 'June 2026 subscription', amount: '$79.00', status: 'paid', issuedOn: '2026-06-01' },
  { id: 'inv-1070', label: 'July 2026 subscription', amount: '$79.00', status: 'upcoming', issuedOn: '2026-07-01' },
]

export const INTEGRATIONS = [
  { name: 'Slack', status: 'Connected', description: 'Launch alerts and timeline milestones' },
  { name: 'Notion', status: 'Beta', description: 'Mirror research docs into project spaces' },
  { name: 'GitHub', status: 'Connected', description: 'Attach commits and releases to events' },
  { name: 'Google Calendar', status: 'Connected', description: 'Sync launch dates and reviews' },
]

export const PRODUCT_UPDATES = [
  'Shared workspaces with role-aware permissions',
  'Executive reporting for launches and delivery health',
  'Billing and plan management for real SaaS operations',
  'Search and recent activity pages wired into the app shell',
]

export function buildWorkspaceMetrics(
  projects: Project[],
  timelines: Timeline[],
  nodes: TimelineNode[],
): WorkspaceMetric[] {
  const activeProjects = projects.filter((project) => !project.isArchived).length
  const completedNodes = nodes.filter((node) => node.status === 'done').length
  const inFlightNodes = nodes.filter((node) => node.status === 'in_progress').length
  const utilization = projects.length === 0 ? 0 : Math.min(98, 48 + activeProjects * 7 + timelines.length * 2)

  return [
    { label: 'Active workspaces', value: String(activeProjects), change: '+12% MoM' },
    { label: 'Timelines modeled', value: String(timelines.length), change: '+18% this quarter' },
    { label: 'Tasks shipped', value: String(completedNodes), change: `${inFlightNodes} in progress` },
    { label: 'Seat utilization', value: `${utilization}%`, change: 'Healthy adoption' },
  ]
}

export function buildActivityFeed(
  recentItems: RecentItem[],
  projects: Project[],
): Array<{ id: string; title: string; detail: string }> {
  const projectMap = new Map(projects.map((project) => [project.id, project.name]))

  return recentItems.slice(0, 6).map((item) => ({
    id: `${item.type}-${item.id}`,
    title: item.title,
    detail:
      item.type === 'project'
        ? 'Workspace opened recently'
        : `Inside ${projectMap.get(item.projectId ?? '') ?? 'your workspace'}`,
  }))
}

export function getCurrentPlan(projects: Project[]): SaaSPlan {
  if (projects.length >= 8) return SAAS_PLANS[2]
  if (projects.length >= 3) return SAAS_PLANS[1]
  return SAAS_PLANS[0]
}
