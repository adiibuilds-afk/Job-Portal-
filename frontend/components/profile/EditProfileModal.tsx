"use client";

import { useState, useEffect } from 'react';
import { X, User, GraduationCap, MapPin, Save, Code, Globe, Plus, Coins, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

interface EditProfileModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditProfileModal({ user, isOpen, onClose, onUpdate }: EditProfileModalProps) {
    const { data: session } = useSession();
    const [formData, setFormData] = useState({
        name: '',
        degree: '',
        location: '',
        batch: '',
        skills: [] as string[],
        portfolioUrl: ''
    });
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            // If the name is generic "User" or empty, and we have a session name, use session name
            const initialName = (user.name === 'User' || !user.name) && session?.user?.name
                ? session.user.name
                : (user.name || '');

            setFormData({
                name: initialName,
                degree: user.degree || '',
                location: user.location || '',
                batch: user.batch || '',
                skills: user.skills || [],
                portfolioUrl: user.portfolioUrl || ''
            });
        }
    }, [user, session]);

    if (!isOpen) return null;

    const addSkill = () => {
        const skills = skillInput.split(',').map(s => s.trim()).filter(s => s && !formData.skills.includes(s));
        if (skills.length > 0) {
            setFormData({ ...formData, skills: [...formData.skills, ...skills] });
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/update`, {
                email: user.email,
                ...formData
            });
            toast.success('Profile updated successfully!', { icon: '✨' });
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const hasNewSkills = formData.skills.length > 0 && (user?.skills?.length || 0) === 0;
    const hasNewPortfolio = formData.portfolioUrl && !user?.portfolioUrl;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-500" />
                        Edit Profile
                    </h3>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    {/* Degree */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Degree / Education
                        </label>
                        <input
                            type="text"
                            value={formData.degree}
                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                            placeholder="e.g. B.Tech in CSE"
                        />
                    </div>

                    {/* Location & Batch */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                                placeholder="e.g. Bangalore"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Graduation Year</label>
                            <input
                                type="text"
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                                placeholder="e.g. 2025"
                            />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Code className="w-4 h-4" /> Skills</span>
                            {hasNewSkills && <span className="text-amber-500 text-xs font-bold flex items-center gap-1"><Coins className="w-3 h-3" /> +3 Coins</span>}
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                                placeholder="e.g. React, Python, SQL"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {formData.skills.map((skill, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium rounded-lg">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="text-amber-500/60 hover:text-amber-500">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                            {formData.skills.length === 0 && (
                                <span className="text-zinc-600 text-sm">Press Enter or click + to add skills</span>
                            )}
                        </div>
                    </div>

                    {/* Portfolio URL */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Portfolio / GitHub</span>
                            {hasNewPortfolio && <span className="text-amber-500 text-xs font-bold flex items-center gap-1"><Coins className="w-3 h-3" /> +2 Coins</span>}
                        </label>
                        <input
                            type="url"
                            value={formData.portfolioUrl}
                            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500/50 transition-all font-medium"
                            placeholder="https://github.com/yourname"
                        />
                    </div>

                    {/* Coin Hint */}
                    {(hasNewSkills || hasNewPortfolio) && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-sm text-amber-500/90">
                                <span className="font-bold">Nice!</span> You'll earn Grid Coins for completing your profile!
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
