"use client";

import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Calendar, Building2, StickyNote, X, Check, Clock, GripVertical, CheckSquare, Square } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface KanbanProps {
    jobs: any[];
    onUpdate: () => void;
    email: string;
}

const COLUMNS = [
    { id: 'applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'offered', label: 'Offered', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
];

export default function JobKanbanBoard({ jobs, onUpdate, email }: KanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // Group jobs by column
    const columns = useMemo(() => {
        const cols: Record<string, any[]> = {
            applied: [],
            interviewing: [],
            offered: [],
            rejected: []
        };
        jobs.forEach(job => {
            const status = job.status || 'applied';
            if (cols[status]) {
                cols[status].push(job);
            }
        });
        return cols;
    }, [jobs]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the job active job
        const job = jobs.find(j => j.jobId._id === activeId);
        if (!job) return;

        const currentStatus = job.status || 'applied';
        let newStatus = currentStatus;

        // If dropped on a column, take column ID
        if (COLUMNS.find(c => c.id === overId)) {
            newStatus = overId;
        } else {
            // If dropped on another job, take that job's status
            const overJob = jobs.find(j => j.jobId._id === overId);
            if (overJob) {
                newStatus = overJob.status || 'applied';
            }
        }

        if (currentStatus === newStatus) return;

        // Optimistic Update
        // We can't easily update the parent state directly, but we can assume the API call will work
        // To make it look "instant", usually we'd need local state mirroring 'jobs'.
        // For now, we will rely on standard API call but with better error handling. 
        // If 'snapping back' is the issue, it's usually because the parent 'jobs' prop hasn't updated yet.
        // We will force a local re-render if we were using local state, but since we are dependent on props, we must wait for onUpdate.
        // However, we can use a ref or local state to temporarily hide the old item or show it in the new place? 
        // Simpler: Just ensure API call happens and return.

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/applied/status`, {
                email,
                jobId: job.jobId._id,
                status: newStatus
            });
            toast.success(`Moved to ${newStatus}`);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const toggleSelectJob = (jobId: string) => {
        setSelectedJobs(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const handleSelectAll = () => {
        if (selectedJobs.length === jobs.length) {
            setSelectedJobs([]);
        } else {
            setSelectedJobs(jobs.map(j => j.jobId._id));
        }
    };

    const handleBulkUpdate = async (status: string) => {
        if (selectedJobs.length === 0) return;

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/applied/status/bulk`, {
                status,
                jobIds: selectedJobs,
                email
            });
            toast.success(`Updated ${selectedJobs.length} jobs to ${status}`);
            setSelectedJobs([]);
            setIsBulkMode(false);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update jobs');
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <div className="space-y-4">
            {/* Bulk Actions Toolbar */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setIsBulkMode(!isBulkMode);
                            setSelectedJobs([]);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isBulkMode ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                        {isBulkMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        {isBulkMode ? 'Exit Selection' : 'Select Jobs'}
                    </button>
                    {isBulkMode && (
                        <button
                            onClick={handleSelectAll}
                            className="text-xs font-bold text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-lg transition-colors"
                        >
                            {selectedJobs.length === jobs.length ? 'Deselect All' : 'Select All'}
                        </button>
                    )}
                    {isBulkMode && (
                        <span className="text-zinc-400 text-sm font-mono">
                            {selectedJobs.length} selected
                        </span>
                    )}
                </div>

                {isBulkMode && selectedJobs.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 uppercase font-black mr-2">Move to:</span>
                        {COLUMNS.map(col => (
                            <button
                                key={col.id}
                                onClick={() => handleBulkUpdate(col.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${col.color} hover:brightness-110 transition-all`}
                            >
                                {col.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-8 min-h-[500px]">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex flex-col min-w-[280px]">
                            <div className={`flex items-center justify-between p-4 rounded-xl border mb-4 bg-zinc-900/50 backdrop-blur-sm ${col.color}`}>
                                <h3 className="font-bold flex items-center gap-2">
                                    {col.label}
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-xs">
                                        {columns[col.id]?.length || 0}
                                    </span>
                                </h3>
                            </div>

                            <div className="flex-1 p-2 rounded-xl bg-zinc-900/20 border border-dashed border-zinc-800/50 min-h-[200px]">
                                <SortableContext
                                    id={col.id}
                                    items={columns[col.id]?.map(j => j.jobId._id) || []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {columns[col.id]?.map(job => (
                                            <SortableItem
                                                key={job.jobId._id}
                                                job={job}
                                                email={email}
                                                onUpdate={onUpdate}
                                                isBulkMode={isBulkMode}
                                                isSelected={selectedJobs.includes(job.jobId._id)}
                                                onToggleSelect={() => toggleSelectJob(job.jobId._id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                                {columns[col.id]?.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-zinc-700 text-xs font-medium italic p-8">
                                        Drop here
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <div className="transform rotate-2 cursor-grabbing">
                            {/* Simplified Drag Overlay Card */}
                            <div className="bg-zinc-800 border-2 border-amber-500 rounded-xl p-4 shadow-2xl w-[280px]">
                                <h4 className="font-bold text-white mb-1">Moving Card...</h4>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

function SortableItem({ job, email, onUpdate, isBulkMode, isSelected, onToggleSelect }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.jobId._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <KanbanCard
                job={job}
                email={email}
                onUpdate={onUpdate}
                dragHandleProps={!isBulkMode ? { ...attributes, ...listeners } : undefined}
                isBulkMode={isBulkMode}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
            />
        </div>
    );
}

function KanbanCard({ job, email, onUpdate, dragHandleProps, isBulkMode, isSelected, onToggleSelect }: any) {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(job.notes || '');
    const [updating, setUpdating] = useState(false);

    const saveNotes = async () => {
        setUpdating(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/applied/status`, {
                email,
                jobId: job.jobId._id,
                notes
            });
            setIsEditingNotes(false);
            onUpdate();
            toast.success('Notes saved');
        } catch (error) {
            toast.error('Failed to save notes');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div
            className={`bg-zinc-900 border rounded-xl p-4 transition-all relative ${isSelected ? 'border-amber-500 bg-zinc-800/80' : 'border-zinc-800 hover:border-zinc-700 hover:shadow-lg'}`}
        >
            {/* Drag Handle or Checkbox */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                {isBulkMode ? (
                    <button onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className="text-zinc-400 hover:text-white">
                        {isSelected ? <CheckSquare className="w-5 h-5 text-amber-500" /> : <Square className="w-5 h-5" />}
                    </button>
                ) : (
                    <div {...dragHandleProps} className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing p-1">
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="pr-8">
                <h4 className="font-bold text-white text-sm line-clamp-1">{job.jobId.title}</h4>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 mb-3">
                    <Building2 className="w-3 h-3" />
                    <span className="line-clamp-1">{job.jobId.company}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-3 border-t border-zinc-800/50 pt-2">
                <Clock className="w-3 h-3" />
                <span>{new Date(job.updatedAt || job.appliedAt).toLocaleDateString()}</span>
            </div>

            {/* Notes Section */}
            <div className="bg-black/40 rounded-lg p-2.5 group-hover:bg-black/60 transition-colors">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <StickyNote className="w-3 h-3" />
                        <span className="font-medium">Notes</span>
                    </div>
                    {!isEditingNotes && (
                        <button
                            onClick={() => setIsEditingNotes(true)}
                            className="text-[10px] text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {isEditingNotes ? (
                    <div className="space-y-2">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-white focus:outline-none focus:border-amber-500 min-h-[60px]"
                            placeholder="Add interview details..."
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setIsEditingNotes(false)}
                                className="p-1 text-zinc-400 hover:text-red-400"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            <button
                                onClick={saveNotes}
                                disabled={updating}
                                className="p-1 text-zinc-400 hover:text-green-400"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-zinc-300 line-clamp-2 min-h-[1.5em] cursor-pointer" onClick={() => setIsEditingNotes(true)}>
                        {notes || <span className="text-zinc-600 italic">Add note...</span>}
                    </p>
                )}
            </div>
        </div>
    );
}
