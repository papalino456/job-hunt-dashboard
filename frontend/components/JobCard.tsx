'use client';

import { Job } from '@/lib/api';
import { Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const getDeadlineInfo = () => {
    if (!job.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(job.deadline);
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { text: 'Expired', urgency: 'expired' };
    if (daysUntil === 0) return { text: 'Today', urgency: 'urgent' };
    if (daysUntil === 1) return { text: 'Tomorrow', urgency: 'urgent' };
    if (daysUntil <= 7) return { text: `${daysUntil}d`, urgency: 'urgent' };
    if (daysUntil <= 30) return { text: `${daysUntil}d`, urgency: 'warning' };
    return { text: `${daysUntil}d`, urgency: 'normal' };
  };
  
  const deadlineInfo = getDeadlineInfo();
  
  const getPriorityBadge = () => {
    switch (job.priority) {
      case 'P0':
        return (
          <span className="badge badge-p0 font-bold">
            P0
          </span>
        );
      case 'P1':
        return (
          <span className="badge badge-p1">
            P1
          </span>
        );
      case 'P2':
        return (
          <span className="badge badge-p2">
            P2
          </span>
        );
      default:
        return null;
    }
  };
  
  const getCardClass = () => {
    if (!deadlineInfo) return 'job-card';
    if (deadlineInfo.urgency === 'urgent') return 'job-card job-card-urgent';
    if (deadlineInfo.urgency === 'warning') return 'job-card job-card-warning';
    return 'job-card';
  };
  
  return (
    <div
      onClick={onClick}
      className={getCardClass()}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-steel-800/50 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-steel-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-semibold text-steel-100">{job.company}</h3>
            <p className="text-steel-400 text-xs">{job.role}</p>
          </div>
        </div>
        {getPriorityBadge()}
      </div>
      
      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-steel-500 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{job.location}</span>
        </div>
        
        {deadlineInfo && (
          <div className={`flex items-center gap-2 text-xs ${
            deadlineInfo.urgency === 'urgent' ? 'text-red-400' :
            deadlineInfo.urgency === 'warning' ? 'text-amber-400' :
            'text-steel-400'
          }`}>
            <Calendar className="w-3 h-3" />
            <span className="font-mono">{deadlineInfo.text}</span>
          </div>
        )}
        
        {job.salary_range && (
          <div className="text-emerald-400/80 text-xs font-mono">
            💰 {job.salary_range}
          </div>
        )}
      </div>
      
      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-steel-800/40">
          {job.tags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className="text-[10px] bg-steel-800/50 text-steel-400 px-2 py-0.5 rounded font-mono"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-[10px] text-steel-500 px-1">+{job.tags.length - 3}</span>
          )}
        </div>
      )}
      
      {/* Source indicator */}
      <div className="mt-3 pt-2 border-t border-steel-800/40 flex items-center justify-between">
        <span className="text-[10px] text-steel-600 font-mono uppercase tracking-wider">
          {job.source}
        </span>
        <ExternalLink className="w-3 h-3 text-steel-600" />
      </div>
    </div>
  );
}
