'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/lib/api';
import { X, Building2, MapPin, Link2, Calendar, DollarSign, Tag, FileText, Trash2, Save } from 'lucide-react';
import AttachmentManager from './AttachmentManager';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onSave: (updates: Partial<Job>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function JobDetailModal({ job, onClose, onSave, onDelete }: JobDetailModalProps) {
  const [formData, setFormData] = useState<Partial<Job>>(job);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setFormData(job);
  }, [job]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this job?')) {
      setSaving(true);
      try {
        await onDelete();
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setSaving(false);
      }
    }
  };
  
  const inputClass = "input w-full text-sm";
  const labelClass = "block text-xs font-mono text-steel-400 mb-1.5 uppercase tracking-wider";
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-steel-900 border border-steel-700/50 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-steel-800/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold text-steel-100">{formData.company}</h2>
              <p className="text-steel-400 text-sm">{formData.role}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-steel-800/50 hover:bg-steel-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-steel-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Company</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <label className={labelClass}>Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          
          {/* Location & URL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Posting URL</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
                <input
                  type="url"
                  value={formData.posting_url || ''}
                  onChange={(e) => setFormData({ ...formData, posting_url: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
          
          {/* Status, Priority, Deadline */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={inputClass}
              >
                <option value="discovered">Discovered</option>
                <option value="researching">Researching</option>
                <option value="ready">Ready</option>
                <option value="applied">Applied</option>
                <option value="phone">Phone Screen</option>
                <option value="onsite">Onsite</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={formData.priority || 'P1'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={inputClass}
              >
                <option value="P0">P0 - Urgent</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Normal</option>
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
                <input
                  type="date"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
          
          {/* Salary */}
          <div>
            <label className={labelClass}>Salary Range</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
              <input
                type="text"
                value={formData.salary_range || ''}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="e.g., $120K-$180K"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-steel-500" />
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className={`${inputClass} pl-10 pt-2 font-mono text-sm resize-none`}
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="border-t border-steel-800/60 pt-5">
            <AttachmentManager jobId={job.id} />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-steel-800/60">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Job
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="btn-secondary disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
