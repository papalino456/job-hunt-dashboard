'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Job } from '@/lib/api';
import PipelineBoard from '@/components/PipelineBoard';
import JobDetailModal from '@/components/JobDetailModal';
import StatsPanel from '@/components/StatsPanel';
import { Briefcase, Search, LogOut, Filter, Plus, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  
  useEffect(() => {
    checkAuthAndLoadJobs();
    
    const interval = setInterval(() => {
      if (!loading) {
        loadJobs();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const checkAuthAndLoadJobs = async () => {
    try {
      const { authenticated } = await api.checkAuth();
      if (!authenticated) {
        window.location.href = '/login';
        return;
      }
      await loadJobs();
    } catch (error) {
      window.location.href = '/login';
    }
  };
  
  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs({ 
        search: searchQuery || undefined,
        priority: filterPriority || undefined
      });
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveJob = async (id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === id ? { ...job, ...updates } : job
    ));
    
    try {
      await api.updateJob(id, updates);
      setSelectedJob(null);
    } catch (error) {
      console.error('Update failed:', error);
      await loadJobs();
    }
  };
  
  const handleDeleteJob = async (id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
    setSelectedJob(null);
    
    try {
      await api.deleteJob(id);
    } catch (error) {
      console.error('Delete failed:', error);
      await loadJobs();
    }
  };
  
  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const stats = {
    total: jobs.length,
    p0: jobs.filter(j => j.priority === 'P0').length,
    p1: jobs.filter(j => j.priority === 'P1').length,
    p2: jobs.filter(j => j.priority === 'P2').length,
    active: jobs.filter(j => ['discovered', 'researching', 'ready', 'applied'].includes(j.status)).length,
    interviews: jobs.filter(j => ['phone', 'onsite'].includes(j.status)).length,
    offers: jobs.filter(j => j.status === 'offer').length
  };
  
  const filteredJobs = searchQuery
    ? jobs.filter(job =>
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;
  
  return (
    <div className="min-h-screen bg-steel-950">
      {/* Hero Header */}
      <div className="hero-gradient border-b border-steel-800/60">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-steel-400 font-mono text-sm tracking-wider">JOB_HUNT_DASHBOARD // V1.0</span>
              </div>
              <h1 className="text-4xl font-mono font-bold gradient-text mb-2">
                Pipeline Tracker
              </h1>
              <p className="text-steel-400 text-sm max-w-xl">
                Tracking {jobs.length} opportunities across robotics, AI, and research roles. 
                {stats.active} active applications, {stats.interviews} in interview stage.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/analytics')}
                className="btn-secondary flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
              
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Bar */}
      <StatsPanel stats={stats} />
      
      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies, roles..."
                className="input w-full pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-steel-500" />
              <select
                value={filterPriority || ''}
                onChange={(e) => setFilterPriority(e.target.value || null)}
                className="input py-2 text-sm"
              >
                <option value="">All Priorities</option>
                <option value="P0">P0 - Urgent</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Normal</option>
              </select>
            </div>
          </div>
          
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Job
          </button>
        </div>
        
        {/* Pipeline Board */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
              <span className="text-steel-400 font-mono text-sm ml-2">Loading pipeline...</span>
            </div>
          </div>
        ) : (
          <PipelineBoard
            jobs={filteredJobs}
            onJobClick={setSelectedJob}
          />
        )}
      </div>
      
      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSave={(updates) => handleSaveJob(selectedJob.id, updates)}
          onDelete={() => handleDeleteJob(selectedJob.id)}
        />
      )}
    </div>
  );
}
