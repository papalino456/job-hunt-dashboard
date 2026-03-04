'use client';

import { Job } from '@/lib/api';
import JobCard from './JobCard';
import { 
  Search, 
  Microscope, 
  CheckCircle2, 
  Send,
  Phone,
  Building2,
  Trophy,
  XCircle,
  ClipboardList
} from 'lucide-react';

interface PipelineBoardProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

const STATUS_COLUMNS = [
  { 
    id: 'discovered', 
    label: 'Discovered',
    icon: Search,
    color: 'text-steel-400',
    bgColor: 'bg-steel-800/30'
  },
  { 
    id: 'researching', 
    label: 'Researching',
    icon: Microscope,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  { 
    id: 'ready', 
    label: 'Ready',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  { 
    id: 'applied', 
    label: 'Applied',
    icon: Send,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  { 
    id: 'phone', 
    label: 'Phone Screen',
    icon: Phone,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  { 
    id: 'onsite', 
    label: 'Onsite',
    icon: Building2,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
  { 
    id: 'offer', 
    label: 'Offer',
    icon: Trophy,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  { 
    id: 'rejected', 
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
];

export default function PipelineBoard({ jobs, onJobClick }: PipelineBoardProps) {
  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status);
  };
  
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {STATUS_COLUMNS.map(column => {
        const columnJobs = getJobsByStatus(column.id);
        const Icon = column.icon;
        
        return (
          <div key={column.id} className="pipeline-column">
            <div className="pipeline-column-header">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${column.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${column.color}`} />
                </div>
                <div>
                  <h2 className="font-mono text-sm font-semibold text-steel-200">
                    {column.label}
                  </h2>
                  <span className="text-xs text-steel-500 font-mono">
                    {columnJobs.length} jobs
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 min-h-[100px]">
              {columnJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => onJobClick(job)}
                />
              ))}
              
              {columnJobs.length === 0 && (
                <div className="card border-dashed border-steel-800/40 opacity-50 py-8">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-steel-600" />
                    <p className="text-steel-500 text-xs text-center font-mono">
                      No jobs
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
