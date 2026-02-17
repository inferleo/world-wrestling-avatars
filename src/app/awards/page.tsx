
"use client";

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Check, Lock, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface VoteCount {
    candidateId: string;
    count: number;
}

export default function AwardsPage() {
    const { user, vote } = useAuth();
    const { awards, wrestlers, isLoading, siteConfig } = useData();
    const [voteCounts, setVoteCounts] = useState<Record<string, VoteCount[]>>({});

    useEffect(() => {
        // Sync all votes from Firestore
        const unsubVotes = onSnapshot(collection(db, 'votes'), (snapshot) => {
            const allVotes = snapshot.docs.map(doc => doc.data());
            const counts: Record<string, VoteCount[]> = {};

            awards.forEach(award => {
                const categoryVotes = allVotes.filter((v: any) => v.categoryId === award.id);
                const candidateCounts: Record<string, number> = {};

                categoryVotes.forEach((v: any) => {
                    candidateCounts[v.candidateId] = (candidateCounts[v.candidateId] || 0) + 1;
                });

                counts[award.id] = Object.entries(candidateCounts).map(([candidateId, count]) => ({
                    candidateId,
                    count
                }));
            });

            setVoteCounts(counts);
        });

        return () => unsubVotes();
    }, [awards]);

    const getVoteCount = (categoryId: string, candidateId: string): number => {
        const categoryCounts = voteCounts[categoryId] || [];
        return categoryCounts.find(c => c.candidateId === candidateId)?.count || 0;
    };

    const getTotalVotes = (categoryId: string): number => {
        const categoryCounts = voteCounts[categoryId] || [];
        return categoryCounts.reduce((sum, c) => sum + c.count, 0);
    };

    const getVotePercentage = (categoryId: string, candidateId: string): number => {
        const total = getTotalVotes(categoryId);
        if (total === 0) return 0;
        return Math.round((getVoteCount(categoryId, candidateId) / total) * 100);
    };

    const isWinner = (categoryId: string, candidateId: string): boolean => {
        const categoryCounts = voteCounts[categoryId] || [];
        if (categoryCounts.length === 0) return false;
        const maxVotes = Math.max(...categoryCounts.map(c => c.count));
        return getVoteCount(categoryId, candidateId) === maxVotes && maxVotes > 0;
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Awards...</div>;

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)] mb-4">
                        WWA Awards
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        The most prestigious night in sports entertainment. Cast your votes for the legends of the ring.
                    </p>
                </div>

                {!user ? (
                    <div className="bg-neutral-900/50 backdrop-blur border border-red-900/50 rounded-xl p-12 text-center max-w-2xl mx-auto">
                        <Lock className="w-16 h-16 text-red-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-4">Voting is Locked</h2>
                        <p className="text-neutral-400 mb-8">You must be a registered member to cast your vote in the WWAA Awards.</p>
                        <Link href="/login" className="bg-yellow-600 text-black font-bold uppercase px-8 py-3 rounded hover:bg-yellow-500 transition-colors inline-block">
                            Login to Vote
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {awards.map((category) => {
                            const votedCandidateId = user.hasVoted?.[category.id];

                            return (
                                <div key={category.id} className="relative">
                                    <h2 className="text-3xl font-black uppercase mb-8 border-l-4 border-yellow-500 pl-4">{category.title}</h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                        {category.candidateIds.map((candidateId) => {
                                            const candidate = wrestlers.find(w => w.id === candidateId);
                                            if (!candidate) return null;

                                            const isSelected = votedCandidateId === candidate.id;
                                            const isDisabled = !!votedCandidateId;
                                            const voteCount = getVoteCount(category.id, candidate.id);
                                            const percentage = getVotePercentage(category.id, candidate.id);
                                            const winner = isWinner(category.id, candidate.id);

                                            return (
                                                <div
                                                    key={candidate.id}
                                                    className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 ${winner && siteConfig.showResults
                                                        ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.6)] scale-105 z-10'
                                                        : isSelected
                                                            ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-105 z-10'
                                                            : 'border-neutral-800 hover:border-neutral-600'
                                                        } ${isDisabled && !isSelected ? 'opacity-50 grayscale' : ''}`}
                                                >
                                                    <div className="aspect-square relative">
                                                        <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                                            <h3 className="text-xl font-bold uppercase text-white leading-tight">{candidate.name}</h3>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="absolute top-4 right-4 bg-yellow-500 text-black rounded-full p-1 shadow-lg">
                                                                <Check size={20} strokeWidth={3} />
                                                            </div>
                                                        )}

                                                        {winner && siteConfig.showResults && (
                                                            <div className="absolute top-4 left-4 bg-yellow-500 text-black rounded-full p-2 shadow-lg animate-pulse">
                                                                <Trophy size={24} strokeWidth={3} />
                                                            </div>
                                                        )}

                                                        {siteConfig.showResults && voteCount > 0 && (
                                                            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white rounded-lg px-3 py-1 text-sm font-bold border border-yellow-500/50">
                                                                {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {siteConfig.showResults && voteCount > 0 && (
                                                        <div className="bg-neutral-900 p-2">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs text-neutral-400">Vote Share</span>
                                                                <span className="text-xs font-bold text-yellow-500">{percentage}%</span>
                                                            </div>
                                                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => vote(category.id, candidate.id)}
                                                        disabled={isDisabled}
                                                        className={`w-full py-3 font-bold uppercase tracking-widest text-sm transition-colors ${isSelected ? 'bg-yellow-500 text-black cursor-default' : 'bg-neutral-800 text-neutral-400 hover:bg-black hover:text-yellow-500'}`}
                                                    >
                                                        {isSelected ? 'Voted' : 'Vote'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}


                        <div className="mt-20 p-8 bg-neutral-900 rounded-xl text-center border border-neutral-800">
                            <h3 className="text-white font-bold text-lg mb-2">Thank you for voting!</h3>
                            <p className="text-neutral-500 text-sm">Results will be revealed live at the ceremony.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
