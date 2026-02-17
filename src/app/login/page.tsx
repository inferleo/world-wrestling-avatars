"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, User } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [secretKey, setSecretKey] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        if (isAdmin) {
            if (secretKey !== 'admin123') {
                alert('Invalid Admin Secret Key!');
                return;
            }
        }

        await login(username, isAdmin ? 'admin' : 'user');
        router.push('/');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-black bg-[url('https://images.unsplash.com/photo-1574607383476-f2c711a39f60?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <div className="relative z-10 w-full max-w-md bg-neutral-900/90 p-8 rounded-2xl border border-neutral-700 shadow-2xl">
                <h1 className="text-3xl font-black text-white mb-2 text-center uppercase">Member Access</h1>
                <p className="text-neutral-400 text-center mb-8">Enter the arena to vote and interact.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-1">Username / Wrestler Name</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
                            placeholder="Enter your name..."
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-neutral-950 rounded-lg border border-neutral-800">
                        <div
                            className="flex-shrink-0 text-red-500 cursor-default select-none"
                            onClick={() => setUsername(prev => prev)}
                        >
                            <button
                                type="button"
                                onClick={() => setIsAdmin(!isAdmin)}
                                className="focus:outline-none"
                            >
                                {isAdmin ? <Shield size={24} /> : <User size={24} />}
                            </button>
                        </div>
                        <div className="flex-grow">
                            <label className="text-sm font-medium text-white block">Arena Access</label>
                            <span className="text-xs text-neutral-500">{isAdmin ? 'Administrator Mode Active' : 'Standard Fan Entry'}</span>
                        </div>
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setIsAdmin(false)}
                                className="text-xs text-red-500 hover:text-red-400 underline uppercase tracking-tighter"
                            >
                                Disable
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label htmlFor="secretKey" className="block text-sm font-medium text-red-500 mb-1">Passkey</label>
                            <input
                                type="password"
                                id="secretKey"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-950 border border-red-900/50 rounded-lg text-white focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder:text-neutral-600"
                                placeholder="Enter access code..."
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-4 rounded-lg uppercase tracking-widest transition-colors shadow-lg shadow-white/10"
                    >
                        Enter The Ring
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-neutral-600">
                    <p>Standard Access: No credentials required.</p>
                </div>
            </div>
        </div>
    );
}
