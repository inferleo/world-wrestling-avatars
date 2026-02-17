
"use client";

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

export default function RosterPage() {
    const { wrestlers, isLoading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'All' | 'Male' | 'Female' | 'Legend'>('All');

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Roster...</div>;

    const filteredWrestlers = wrestlers.filter(wrestler => {
        const matchesSearch = wrestler.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || wrestler.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-black uppercase mb-8 text-center tracking-tighter text-red-600 drop-shadow-md">Superstar Roster</h1>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-neutral-900 p-6 rounded-lg border border-neutral-800 mb-12 shadow-lg gap-4">
                    {/* Category Tabs */}
                    <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {['All', 'Male', 'Female', 'Legend'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat as any)}
                                className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-wider transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] transform scale-105' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                        <input
                            type="text"
                            placeholder="Find a Superstar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black border border-neutral-700 rounded-full text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 placeholder:text-neutral-600 transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredWrestlers.map((wrestler) => (
                        <div key={wrestler.id} className="group relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-600 transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:-translate-y-2">
                            <div className="aspect-[3/4] overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
                                <img
                                    src={wrestler.image}
                                    alt={wrestler.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                                    <span className="text-red-500 font-bold uppercase text-xs tracking-widest block mb-1">{wrestler.category}</span>
                                    <h2 className="text-2xl font-black text-white uppercase italic leading-none mb-1">{wrestler.name}</h2>
                                    <p className="text-neutral-400 text-sm italic opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 text-shadow">"{wrestler.tagline}"</p>
                                </div>
                            </div>
                            {/* Stats Overlay (Hover) */}
                            <div className="absolute top-0 right-0 bg-red-600/90 text-white p-2 text-xs font-bold rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                OVR: {Math.round((wrestler.stats.strength + wrestler.stats.agility + wrestler.stats.technique + wrestler.stats.charisma) / 4)}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredWrestlers.length === 0 && (
                    <div className="text-center py-20 text-neutral-500">
                        <p className="text-xl">No superstars found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
