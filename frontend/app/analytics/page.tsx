'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock, 
  Target, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowLeft,
  Flame,
  MapPin,
  Tag
} from 'lucide-react';

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byResearch: Record<string, number>;
  recentApplications: number;
  readyToApply: number;
}

interface Job {
  id: string;
  company: string;
  role: string;
  location: string;
  status: string;
  priority: string;
  research_status: string;
  tags: string[];
  notes: string;
  date_discovered: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'ready' | 'p0'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { authenticated } = await api.checkAuth();
      if (!authenticated) {
        window.location.href = '/login';
        return;
      }

      const [statsData, jobsData] = await Promise.all([
        api.getStats(),
        api.getJobs()
      ]);

      setStats(statsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      discovered: 'bg-steel-600',
      researching: 'bg-blue-600',
      ready: 'bg-amber-500',
      applied: 'bg-emerald-600',
      phone: 'bg-purple-600',
      onsite: 'bg-pink-600',
      offer: 'bg-green-500',
      rejected: 'bg-red-600'
    };
    return colors[status] || 'bg-steel-600';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'P0') return <Flame className="w-4 h-4 text-red-500" />;
    if (priority === 'P1') return <Target className="w-4 h-4 text-amber-500" />;
    return <Briefcase className="w-4 h-4 text-steel-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-steel-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
          <span className="text-steel-400 font-mono text-sm ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const researchJobs = jobs.filter(j => j.research_status === 'pending');
  const readyJobs = jobs.filter(j => j.status === 'ready');
  const p0Jobs = jobs.filter(j => j.priority === 'P0');

  return (
    <div className="min-h-screen bg-steel-950 text-steel-100">
      {/* Header */}
      <header className="border-b border-steel-800 bg-steel-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-steel-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-steel-400" />
              </button>
              <h1 className="text-xl font-semibold text-steel-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Analytics & Insights
              </h1>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 text-sm bg-steel-800 hover:bg-steel-700 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-steel-800">
          {[
            { id: 'overview', label: 'Overview', icon: PieChart },
            { id: 'research', label: `Research Queue (${researchJobs.length})`, icon: Search },
            { id: 'ready', label: `Ready to Apply (${readyJobs.length})`, icon: CheckCircle },
            { id: 'p0', label: `P0 Priority (${p0Jobs.length})`, icon: Flame },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-steel-400 hover:text-steel-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={Briefcase}
                label="Total Jobs"
                value={stats.total}
                color="blue"
              />
              <MetricCard
                icon={CheckCircle}
                label="Ready to Apply"
                value={stats.readyToApply}
                color="green"
              />
              <MetricCard
                icon={Search}
                label="Need Research"
                value={stats.byResearch.pending || 0}
                color="amber"
              />
              <MetricCard
                icon={TrendingUp}
                label="This Week"
                value={stats.recentApplications}
                color="purple"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* By Status */}
              <div className="bg-steel-900/50 border border-steel-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-steel-200 mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-500" />
                  Pipeline Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.byStatus)
                    .sort(([,a], [,b]) => b - a)
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="flex-1 capitalize text-steel-300">{status}</span>
                        <span className="font-mono text-steel-100">{count}</span>
                        <div className="w-24 h-2 bg-steel-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getStatusColor(status)}`}
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* By Priority */}
              <div className="bg-steel-900/50 border border-steel-800 rounded-xl p-6">
                <h3 className="text-lg font-medium text-steel-200 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  Priority Distribution
                </h3>
                <div className="space-y-4">
                  {[
                    { key: 'P0', label: 'Critical (P0)', color: 'bg-red-500' },
                    { key: 'P1', label: 'High (P1)', color: 'bg-amber-500' },
                    { key: 'P2', label: 'Normal (P2)', color: 'bg-steel-500' },
                  ].map(priority => {
                    const count = stats.byPriority[priority.key] || 0;
                    return (
                      <div key={priority.key} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                        <span className="flex-1 text-steel-300">{priority.label}</span>
                        <span className="font-mono text-steel-100">{count}</span>
                        <div className="w-24 h-2 bg-steel-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${priority.color}`}
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-steel-900/50 border border-steel-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-steel-200 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Suggested Actions
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {stats.readyToApply > 0 && (
                  <ActionCard
                    priority="high"
                    title={`${stats.readyToApply} job(s) ready to apply`}
                    description="These jobs are fully researched and ready for applications"
                    action="View Ready Jobs"
                    onClick={() => setActiveTab('ready')}
                  />
                )}
                {(stats.byResearch.pending || 0) > 0 && (
                  <ActionCard
                    priority="medium"
                    title={`${stats.byResearch.pending} job(s) need research`}
                    description="Research these companies and roles to move them forward"
                    action="View Research Queue"
                    onClick={() => setActiveTab('research')}
                  />
                )}
                {(stats.byPriority.P0 || 0) > 0 && (
                  <ActionCard
                    priority="high"
                    title={`${stats.byPriority.P0} P0 priority job(s)`}
                    description="Critical priority jobs that need attention"
                    action="View P0 Jobs"
                    onClick={() => setActiveTab('p0')}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Research Queue Tab */}
        {activeTab === 'research' && (
          <JobList 
            jobs={researchJobs} 
            title="Research Queue"
            description="Jobs that need research before applying"
            emptyMessage="No jobs waiting for research!"
          />
        )}

        {/* Ready to Apply Tab */}
        {activeTab === 'ready' && (
          <JobList 
            jobs={readyJobs}
            title="Ready to Apply"
            description="Fully researched jobs ready for application"
            emptyMessage="No jobs ready to apply yet. Mark some jobs as 'ready' to see them here."
            highlight
          />
        )}

        {/* P0 Priority Tab */}
        {activeTab === 'p0' && (
          <JobList 
            jobs={p0Jobs}
            title="P0 Priority Jobs"
            description="Critical priority opportunities"
            emptyMessage="No P0 priority jobs."
          />
        )}
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { 
  icon: any, 
  label: string, 
  value: number, 
  color: string 
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ActionCard({ 
  priority, 
  title, 
  description, 
  action, 
  onClick 
}: { 
  priority: 'high' | 'medium' | 'low', 
  title: string, 
  description: string, 
  action: string,
  onClick: () => void
}) {
  const borderColors = {
    high: 'border-red-500/30 hover:border-red-500/50',
    medium: 'border-amber-500/30 hover:border-amber-500/50',
    low: 'border-steel-600 hover:border-steel-500',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 bg-steel-800/50 border ${borderColors[priority]} rounded-lg hover:bg-steel-800 transition-all`}
    >
      <div className="font-medium text-steel-200 mb-1">{title}</div>
      <p className="text-sm text-steel-400 mb-3">{description}</p>
      <span className="text-sm text-blue-400 hover:text-blue-300">{action} →</span>
    </button>
  );
}

function JobList({ 
  jobs, 
  title, 
  description, 
  emptyMessage,
  highlight = false
}: { 
  jobs: Job[], 
  title: string, 
  description: string, 
  emptyMessage: string,
  highlight?: boolean
}) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-steel-500 mb-2">📭</div>
        <p className="text-steel-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-steel-200">{title}</h3>
        <p className="text-sm text-steel-400">{description}</p>
      </div>
      <div className="space-y-3">
        {jobs.map(job => (
          <div 
            key={job.id} 
            className={`p-4 rounded-lg border transition-all ${
              highlight 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-steel-900/30 border-steel-800 hover:border-steel-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    job.priority === 'P0' ? 'bg-red-500/20 text-red-400' :
                    job.priority === 'P1' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-steel-600/30 text-steel-400'
                  }`}>
                    {job.priority}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-steel-800 text-steel-400 capitalize">
                    {job.status}
                  </span>
                </div>
                <h4 className="font-medium text-steel-200">{job.company}</h4>
                <p className="text-sm text-steel-400">{job.role}</p>
              </div>
              <a
                href={job.posting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 bg-blue-500/10 rounded-lg transition-colors"
              >
                View Posting
              </a>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-steel-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
              {job.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {job.tags.slice(0, 3).join(', ')}
                  {job.tags.length > 3 && ` +${job.tags.length - 3}`}
                </span>
              )}
            </div>
            {job.notes && (
              <p className="mt-2 text-xs text-steel-500 line-clamp-2">{job.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
