"use client";

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Trash2, Download, Plus, Edit2, X, Check, Star } from 'lucide-react';
import { Wrestler } from '@/data';

interface VoteRecord {
    id: string; // Added id for Firestore deletion
    categoryId: string;
    candidateId: string;
    userId: string; // Changed from 'user' to 'userId' to match schema
    username: string; // Added username
    timestamp: any; // Firestore serverTimestamp
    ip: string;
}

import { db } from '@/lib/firebase';
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    doc,
    deleteDoc
} from 'firebase/firestore';

export default function AdminPage() {
    const { user } = useAuth();
    const { wrestlers, addWrestler, updateWrestler, deleteWrestler, awards, siteConfig, updateSiteConfig, news, addNews, deleteNews, addAward, deleteAward, updateAward } = useData();
    const router = useRouter();
    const [votes, setVotes] = useState<VoteRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'stats' | 'roster' | 'content' | 'news' | 'awards'>('stats');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWrestler, setEditingWrestler] = useState<Partial<Wrestler>>({});
    const [isNewWrestler, setIsNewWrestler] = useState(false);

    // Site Config State
    const [configForm, setConfigForm] = useState(siteConfig);

    // News Form State
    const [newsForm, setNewsForm] = useState({ title: '', content: '', image: '' });

    const [newAwardTitle, setNewAwardTitle] = useState('');
    const [selectedAwardId, setSelectedAwardId] = useState<string | null>(null);

    // File Upload States
    const [wrestlerFile, setWrestlerFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [newsFile, setNewsFile] = useState<File | null>(null);

    useEffect(() => {
        if (siteConfig) setConfigForm(siteConfig);
    }, [siteConfig]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/');
            return;
        }

        // Sync all votes from Firestore
        const unsubVotes = onSnapshot(query(collection(db, 'votes'), orderBy('timestamp', 'desc')), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as VoteRecord));
            setVotes(data);
        });

        return () => unsubVotes();
    }, [user, router]);

    const handleDeleteVote = async (id: string) => {
        if (confirm('Are you sure you want to delete this vote?')) {
            await deleteDoc(doc(db, 'votes', id));
        }
    };

    const handleEditWrestler = (wrestler?: Wrestler) => {
        if (wrestler) {
            setEditingWrestler({ ...wrestler });
            setIsNewWrestler(false);
        } else {
            setEditingWrestler({
                id: Date.now().toString(),
                name: '',
                bio: '',
                image: 'https://via.placeholder.com/400x400?text=Superstar',
                stats: { strength: 50, agility: 50, technique: 50, charisma: 50 },
                category: 'Male',
                tagline: ''
            });
            setIsNewWrestler(true);
        }
        setWrestlerFile(null); // Clear previous file state
        setIsEditModalOpen(true);
    };

    const handleSaveWrestler = async () => {
        if (!editingWrestler.name) {
            alert('Name is required');
            return;
        }

        try {
            if (isNewWrestler) {
                await addWrestler(editingWrestler as Wrestler, wrestlerFile || undefined);
            } else {
                await updateWrestler(editingWrestler as Wrestler, wrestlerFile || undefined);
            }
            setIsEditModalOpen(false);
            setWrestlerFile(null);
        } catch (error) {
            console.error("Failed to save wrestler:", error);
            alert("Error saving superstar. Please check your connection and file size.");
        }
    };

    const handleDeleteWrestler = (id: string) => {
        if (confirm('Are you sure you want to delete this wrestler? This cannot be undone.')) {
            deleteWrestler(id);
        }
    };

    const handleSaveNews = async () => {
        if (!newsForm.title || !newsForm.content) {
            alert('Title and Content are required');
            return;
        }

        try {
            await addNews({
                id: Date.now().toString(),
                title: newsForm.title,
                content: newsForm.content,
                image: newsForm.image || 'https://via.placeholder.com/600x400?text=News',
                date: new Date().toISOString()
            }, newsFile || undefined);

            setNewsForm({ title: '', content: '', image: '' });
            setNewsFile(null);
            alert('News published!');
        } catch (error) {
            console.error("Failed to save news:", error);
            alert("Error publishing news.");
        }
    };

    const handleAddAward = () => {
        if (!newAwardTitle.trim()) return;
        addAward({
            id: Date.now().toString(),
            title: newAwardTitle,
            candidateIds: []
        });
        setNewAwardTitle('');
    };

    const toggleNominee = (awardId: string, wrestlerId: string) => {
        const award = awards.find(a => a.id === awardId);
        if (!award) return;

        let newCandidates;
        if (award.candidateIds.includes(wrestlerId)) {
            newCandidates = award.candidateIds.filter(id => id !== wrestlerId);
        } else {
            newCandidates = [...award.candidateIds, wrestlerId];
        }

        updateAward({
            ...award,
            candidateIds: newCandidates
        });
    };

    const getCandidateName = (id: string) => wrestlers.find(w => w.id === id)?.name || 'Unknown';
    const getCategoryTitle = (id: string) => awards.find(a => a.id === id)?.title || 'Unknown';

    if (!user || user.role !== 'admin') return null;

    const totalVotes = votes.length;
    const uniqueUsers = new Set(votes.map(v => v.userId)).size;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-600 p-3 rounded-lg">
                            <ShieldAlert className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight font-oswald">Admin Dashboard</h1>
                            <p className="text-neutral-400">Manage voting data and system status.</p>
                        </div>
                    </div>

                    <div className="flex bg-neutral-900 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'stats' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Overview & Votes
                        </button>
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'roster' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Roster Management
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'content' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Site Content
                        </button>
                        <button
                            onClick={() => setActiveTab('news')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'news' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                        >
                            News
                        </button>
                        <button
                            onClick={() => setActiveTab('awards')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'awards' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Voting & Awards
                        </button>
                    </div>
                </div>

                {activeTab === 'stats' ? (
                    <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                                <span className="text-neutral-500 uppercase text-xs font-bold tracking-wider">Total Votes Cast</span>
                                <p className="text-4xl font-black text-white mt-2">{totalVotes}</p>
                            </div>
                            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                                <span className="text-neutral-500 uppercase text-xs font-bold tracking-wider">Active Voters</span>
                                <p className="text-4xl font-black text-white mt-2">{uniqueUsers}</p>
                            </div>
                            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
                                <span className="text-neutral-500 uppercase text-xs font-bold tracking-wider">System Status</span>
                                <p className="text-4xl font-black text-green-500 mt-2">ONLINE</p>
                            </div>
                        </div>

                        {/* Vote Management */}
                        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white font-oswald uppercase">Recent Votes Log</h2>
                                <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded text-sm transition-colors">
                                    <Download size={16} /> Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Candidate</th>
                                            <th className="p-4">Timestamp</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800 text-sm">
                                        {votes.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-neutral-500">No votes recorded yet.</td>
                                            </tr>
                                        ) : (
                                            votes.map((vote) => (
                                                <tr key={vote.id} className="hover:bg-neutral-800/50 transition-colors">
                                                    <td className="p-4 font-medium text-white">{vote.username || 'Anonymous'}</td>
                                                    <td className="p-4 text-neutral-300">{getCategoryTitle(vote.categoryId)}</td>
                                                    <td className="p-4 text-yellow-500">{getCandidateName(vote.candidateId)}</td>
                                                    <td className="p-4 text-neutral-500">
                                                        {vote.timestamp?.toDate ? vote.timestamp.toDate().toLocaleString() : 'Just now'}
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDeleteVote(vote.id)}
                                                            className="text-red-500 hover:text-red-400 p-1 hover:bg-neutral-700 rounded transition-colors"
                                                            title="Delete Vote"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white font-oswald uppercase">Roster Management</h2>
                            <button
                                onClick={() => handleEditWrestler()}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors font-bold uppercase"
                            >
                                <Plus size={16} /> Add Wrestler
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-950 text-neutral-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4">Avatar</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Overall</th>
                                        <th className="p-4 w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800 text-sm">
                                    {wrestlers.map((wrestler) => (
                                        <tr key={wrestler.id} className="hover:bg-neutral-800/50 transition-colors">
                                            <td className="p-4">
                                                <img src={wrestler.image} alt={wrestler.name} className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                                            </td>
                                            <td className="p-4 font-bold text-white font-oswald text-lg">{wrestler.name}</td>
                                            <td className="p-4 text-neutral-400">{wrestler.category}</td>
                                            <td className="p-4 text-yellow-500 font-bold">
                                                {Math.round((wrestler.stats.strength + wrestler.stats.agility + wrestler.stats.technique + wrestler.stats.charisma) / 4)}
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                <button
                                                    onClick={() => handleEditWrestler(wrestler)}
                                                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-blue-400 rounded transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWrestler(wrestler.id)}
                                                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-red-500 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white font-oswald uppercase">Site Configuration</h2>
                            <button
                                onClick={async () => {
                                    try {
                                        await updateSiteConfig(configForm, logoFile || undefined);
                                        setLogoFile(null);
                                        alert('Site configuration saved!');
                                    } catch (error) {
                                        console.error("Failed to save config:", error);
                                        alert("Error saving configuration.");
                                    }
                                }}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors font-bold uppercase"
                            >
                                <Check size={16} /> Save Changes
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Branding</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Site Logo (Max 500KB)</label>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-neutral-800 rounded flex items-center justify-center border border-neutral-700">
                                                    {configForm.logoImage ? (
                                                        <img src={configForm.logoImage} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                                                    ) : (
                                                        <span className="text-xs text-neutral-500">Default</span>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            if (file.size > 1024 * 1024 * 2) { // 2MB limit for storage
                                                                alert("File size too large! Please upload images under 2MB.");
                                                                return;
                                                            }
                                                            setLogoFile(file);
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setConfigForm({ ...configForm, logoImage: reader.result as string });
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3 mt-8">Hero Section</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Main Title</label>
                                            <input
                                                type="text"
                                                value={configForm.heroTitle}
                                                onChange={(e) => setConfigForm({ ...configForm, heroTitle: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Subtitle (Line 1)</label>
                                            <input
                                                type="text"
                                                value={configForm.heroSubtitle}
                                                onChange={(e) => setConfigForm({ ...configForm, heroSubtitle: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Description (Line 2 - Red)</label>
                                            <input
                                                type="text"
                                                value={configForm.heroDescription}
                                                onChange={(e) => setConfigForm({ ...configForm, heroDescription: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Featured Content</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Featured Superstar</label>
                                            <select
                                                value={configForm.featuredWrestlerId}
                                                onChange={(e) => setConfigForm({ ...configForm, featuredWrestlerId: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                            >
                                                {wrestlers.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-neutral-500 mt-2">Selected wrestler will appear on the Homepage.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Welcome Message</label>
                                            <input
                                                type="text"
                                                value={configForm.welcomeMessage}
                                                onChange={(e) => setConfigForm({ ...configForm, welcomeMessage: e.target.value })}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-neutral-700 flex justify-between items-center sticky top-0 bg-neutral-900 z-10">
                                <h3 className="text-2xl font-black font-oswald uppercase text-white">
                                    {isNewWrestler ? 'Hire New Talent' : 'Edit Superstar'}
                                </h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Superstar Name</label>
                                        <input
                                            type="text"
                                            value={editingWrestler.name}
                                            onChange={(e) => setEditingWrestler({ ...editingWrestler, name: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Tagline</label>
                                        <input
                                            type="text"
                                            value={editingWrestler.tagline}
                                            onChange={(e) => setEditingWrestler({ ...editingWrestler, tagline: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Category</label>
                                        <select
                                            value={editingWrestler.category}
                                            onChange={(e) => setEditingWrestler({ ...editingWrestler, category: e.target.value as any })}
                                            className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Legend">Legend</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Image (Max 500KB)</label>
                                        <div className="flex gap-4 items-center">
                                            {editingWrestler.image && (
                                                <img src={editingWrestler.image} alt="Preview" className="w-16 h-16 rounded object-cover border border-neutral-700" />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 1024 * 1024 * 5) { // 5MB limit
                                                            alert("File size too large! Please upload images under 5MB.");
                                                            return;
                                                        }
                                                        setWrestlerFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setEditingWrestler({ ...editingWrestler, image: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Biography</label>
                                    <textarea
                                        value={editingWrestler.bio}
                                        onChange={(e) => setEditingWrestler({ ...editingWrestler, bio: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none h-32"
                                    />
                                </div>

                                <div className="bg-neutral-950 rounded p-4 border border-neutral-800">
                                    <h4 className="font-bold text-sm text-white mb-4 uppercase">Attributes (0-100)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['strength', 'agility', 'technique', 'charisma'].map((stat) => (
                                            <div key={stat}>
                                                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">{stat}</label>
                                                <input
                                                    type="number"
                                                    min="0" max="100"
                                                    value={editingWrestler.stats?.[stat as keyof typeof editingWrestler.stats]}
                                                    onChange={(e) => setEditingWrestler({
                                                        ...editingWrestler,
                                                        stats: { ...editingWrestler.stats!, [stat]: parseInt(e.target.value) || 0 }
                                                    })}
                                                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white focus:border-red-600 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-neutral-700 flex justify-end gap-3 sticky bottom-0 bg-neutral-900">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-3 rounded text-neutral-400 hover:text-white font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveWrestler}
                                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    <Check size={18} /> Save Superstar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'news' && (
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white font-oswald uppercase">News Management</h2>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Add News Form */}
                            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800">
                                <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-red-600 pl-3">Post New Article</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Headline</label>
                                        <input
                                            type="text"
                                            value={newsForm.title}
                                            onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none"
                                            placeholder="Enter article title..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Article Image (Max 500KB)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 1024 * 1024 * 5) {
                                                            alert("File size too large! Please upload images under 5MB.");
                                                            return;
                                                        }
                                                        setNewsFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setNewsForm({ ...newsForm, image: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                                            />
                                        </div>
                                        {newsForm.image && (
                                            <div className="h-24 w-full bg-neutral-900 rounded overflow-hidden border border-neutral-700">
                                                <img src={newsForm.image} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Content</label>
                                        <textarea
                                            value={newsForm.content}
                                            onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-white focus:border-red-600 outline-none h-32"
                                            placeholder="Write your story here..."
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSaveNews}
                                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase transition-colors flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Publish News
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* News List */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Recent Articles</h3>
                                <div className="space-y-4">
                                    {news.length === 0 ? (
                                        <p className="text-neutral-500 italic">No news articles published yet.</p>
                                    ) : (
                                        news.map((item) => (
                                            <div key={item.id} className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 flex gap-4 items-start">
                                                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded border border-neutral-700 bg-neutral-900" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-white text-lg leading-tight">{item.title}</h4>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Delete this article?')) deleteNews(item.id);
                                                            }}
                                                            className="text-neutral-500 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-red-500 font-bold uppercase mt-1">{new Date(item.date).toLocaleDateString()}</p>
                                                    <p className="text-neutral-400 text-sm mt-2 line-clamp-2">{item.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'awards' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-black p-6 rounded-xl">
                        {/* Awards List & Add Form */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Add Award Category</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={newAwardTitle}
                                        onChange={(e) => setNewAwardTitle(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-white focus:border-yellow-500 outline-none"
                                        placeholder="E.g., Wrestler of the Year"
                                    />
                                    <button
                                        onClick={handleAddAward}
                                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase py-2 rounded transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Create Award
                                    </button>
                                </div>
                            </div>

                            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                                <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Results Display</h3>
                                <div className="space-y-4">
                                    <p className="text-neutral-400 text-sm">Control whether voting results are visible to users on the Awards page.</p>
                                    <button
                                        onClick={() => updateSiteConfig({ ...siteConfig, showResults: !siteConfig.showResults })}
                                        className={`w-full py-3 rounded font-bold uppercase transition-colors ${siteConfig.showResults ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'}`}
                                    >
                                        {siteConfig.showResults ? '✓ Results Visible' : 'Results Hidden'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                                <div className="p-4 border-b border-neutral-800">
                                    <h3 className="text-lg font-bold text-white font-oswald uppercase">Awards List</h3>
                                </div>
                                <div className="p-2 space-y-2">
                                    {awards.map(award => (
                                        <div
                                            key={award.id}
                                            onClick={() => setSelectedAwardId(award.id)}
                                            className={`p-4 rounded cursor-pointer transition-colors border ${selectedAwardId === award.id ? 'bg-yellow-500/10 border-yellow-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className={`font-bold ${selectedAwardId === award.id ? 'text-yellow-500' : 'text-white'}`}>{award.title}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this award category?')) {
                                                            deleteAward(award.id);
                                                            if (selectedAwardId === award.id) setSelectedAwardId(null);
                                                        }
                                                    }}
                                                    className="text-neutral-500 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-neutral-500 mt-1">{award.candidateIds?.length || 0} Nominees</p>
                                        </div>
                                    ))}
                                    {awards.length === 0 && <p className="text-neutral-500 text-center py-4 italic">No awards created.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Edit Award / Manage Nominees */}
                        <div className="lg:col-span-2">
                            {selectedAwardId ? (
                                <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                                    <div className="p-6 border-b border-neutral-800">
                                        <h2 className="text-xl font-bold text-white font-oswald uppercase">Manage Nominees: <span className="text-yellow-500">{awards.find(a => a.id === selectedAwardId)?.title}</span></h2>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-neutral-400 mb-6">Select the superstars to be nominated for this award category.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                                            {wrestlers.map(wrestler => {
                                                const currentAward = awards.find(a => a.id === selectedAwardId);
                                                const isNominated = currentAward?.candidateIds.includes(wrestler.id);

                                                return (
                                                    <div
                                                        key={wrestler.id}
                                                        onClick={() => toggleNominee(selectedAwardId, wrestler.id)}
                                                        className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${isNominated ? 'bg-yellow-500/20 border-yellow-500' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isNominated ? 'bg-yellow-500 border-yellow-500' : 'bg-transparent border-neutral-600'}`}>
                                                            {isNominated && <Check size={14} className="text-black" strokeWidth={3} />}
                                                        </div>
                                                        <img src={wrestler.image} alt={wrestler.name} className="w-10 h-10 rounded object-cover bg-neutral-800" />
                                                        <span className={`font-bold text-sm ${isNominated ? 'text-white' : 'text-neutral-400'}`}>{wrestler.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center h-full flex flex-col items-center justify-center">
                                    <Star className="w-16 h-16 text-neutral-800 mb-4" />
                                    <p className="text-neutral-500 text-lg">Select an award category to manage nominees.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
