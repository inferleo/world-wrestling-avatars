"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Trophy, Users, LogIn, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { siteConfig } = useData();

    return (
        <nav className="bg-neutral-900 border-b border-red-900 text-white sticky top-0 z-50 shadow-lg shadow-red-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex-shrink-0">
                            {siteConfig?.logoImage ? (
                                <img src={siteConfig.logoImage} alt="WWA Logo" className="h-12 w-auto drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] object-contain" />
                            ) : (
                                <img src="/logo.svg" alt="WWA Logo" className="h-12 w-auto drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                            )}
                        </Link>
                        <Link href="/" className="flex flex-col">
                            <span className="font-black text-3xl tracking-tighter italic text-white uppercase leading-none font-oswald text-shadow-sm">
                                WWA
                            </span>
                            <span className="text-red-600 font-bold text-xs tracking-[0.2em] uppercase leading-none">
                                World Wrestling Avatars
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/roster" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors text-gray-300 hover:text-white flex items-center gap-2">
                                <Users size={18} /> Roster
                            </Link>
                            <Link href="/awards" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors text-gray-300 hover:text-white flex items-center gap-2">
                                <Trophy size={18} /> Awards
                            </Link>
                            {user?.role === 'admin' && (
                                <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors text-red-400 hover:text-red-300 flex items-center gap-2">
                                    <Shield size={18} /> Admin
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="block">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">Hello, <span className="text-white font-bold">{user.username}</span></span>
                                <button onClick={logout} className="p-2 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center gap-2">
                                <LogIn size={16} /> Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
