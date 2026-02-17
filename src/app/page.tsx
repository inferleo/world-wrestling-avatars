"use client";

import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { Star, ChevronRight, Zap, Users, Trophy, Shield, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { wrestlers, siteConfig, news, isLoading } = useData();
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Effect to find the index of the configured featured wrestler initially
  useEffect(() => {
    if (wrestlers.length > 0 && siteConfig.featuredWrestlerId) {
      const index = wrestlers.findIndex(w => w.id === siteConfig.featuredWrestlerId);
      if (index !== -1) setFeaturedIndex(index);
    }
  }, [wrestlers, siteConfig.featuredWrestlerId]);

  const featuredWrestler = wrestlers.length > 0 ? wrestlers[featuredIndex] : null;

  const nextWrestler = () => {
    setFeaturedIndex((prev) => (prev + 1) % wrestlers.length);
  };

  const prevWrestler = () => {
    setFeaturedIndex((prev) => (prev - 1 + wrestlers.length) % wrestlers.length);
  };

  if (isLoading || !featuredWrestler) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Arena...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b-8 border-red-900">
        <div className="absolute inset-0 bg-neutral-900 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
        </div>

        <div className="relative z-10 text-center max-w-5xl px-4">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 mb-2 uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-oswald italic transform -skew-x-6">
            {siteConfig.heroTitle}
          </h1>
          <p className="text-2xl md:text-3xl text-neutral-300 mb-10 max-w-3xl mx-auto font-light font-roboto tracking-wide">
            {siteConfig.heroSubtitle} <br />
            <span className="text-red-600 font-bold">{siteConfig.heroDescription}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/roster" className="bg-red-700 hover:bg-red-600 text-white px-10 py-5 rounded-none skew-x-[-10deg] font-black uppercase tracking-widest transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-3 border-2 border-red-500">
              <span className="skew-x-[10deg] flex items-center gap-2"><Zap className="fill-current" /> View Roster</span>
            </Link>
            <Link href="/awards" className="bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-10 py-5 rounded-none skew-x-[-10deg] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <span className="skew-x-[10deg] flex items-center gap-2"><Star className="fill-current" /> Vote Now</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Wrestler Slider Section */}
      <section className="py-20 bg-neutral-900 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <button
              onClick={prevWrestler}
              className="p-4 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors z-20 border border-neutral-700"
            >
              <ChevronLeft size={32} />
            </button>
            <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-5xl mx-auto">
              <div className="w-full md:w-1/2 relative h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-full blur-3xl" />
                <img
                  src={featuredWrestler.image}
                  alt={featuredWrestler.name}
                  className="relative z-10 w-full h-full object-cover rounded-lg shadow-2xl border-4 border-red-900/50 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-yellow-500 font-black tracking-[0.3em] uppercase mb-2 block font-oswald text-xl">Featured Superstar</span>
                <h2 className="text-6xl font-black text-white mb-4 uppercase font-oswald italic transform -skew-x-3">{featuredWrestler.name}</h2>
                <p className="text-3xl text-neutral-500 font-light italic mb-6 font-oswald border-l-4 border-red-600 pl-4">"{featuredWrestler.tagline}"</p>
                <p className="text-neutral-300 text-lg mb-8 leading-relaxed font-roboto">
                  {featuredWrestler.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8 font-oswald tracking-widest">
                  {Object.entries(featuredWrestler.stats).map(([stat, value]) => (
                    <div key={stat}>
                      <span className="text-neutral-500 text-sm uppercase font-bold">{stat}</span>
                      <div className="h-4 bg-neutral-800 skew-x-[-10deg] mt-1 border border-neutral-700">
                        <div className={`h-full ${stat === 'strength' ? 'bg-red-600' : stat === 'agility' ? 'bg-yellow-500' : stat === 'technique' ? 'bg-blue-600' : 'bg-purple-600'}`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <Link href={`/roster?id=${featuredWrestler.id}`} className="text-white hover:text-red-500 font-bold flex items-center gap-2 group font-oswald uppercase tracking-widest text-xl">
                  Full Profile <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <button
              onClick={nextWrestler}
              className="p-4 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors z-20 border border-neutral-700"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-white uppercase border-l-8 border-red-600 pl-4">Latest News</h2>
            <div className="h-1 bg-neutral-800 flex-1 ml-8 transform skew-x-[-20deg]" />
          </div>

          {news.length === 0 ? (
            <p className="text-neutral-500 text-center italic text-xl">No recent news reported.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <div key={item.id} className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-600 transition-all hover:-translate-y-2">
                  <div className="h-48 overflow-hidden relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 font-oswald uppercase leading-tight group-hover:text-red-500 transition-colors">{item.title}</h3>
                    <p className="text-neutral-400 text-sm line-clamp-3">{item.content}</p>
                    <button className="mt-4 text-red-500 font-bold uppercase text-xs tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Blocks */}
      <section className="py-20 bg-neutral-950 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-12 uppercase">Join The Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-900 p-8 rounded-lg border border-neutral-800 hover:border-red-900 transition-colors group">
              <div className="bg-red-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-900/40 transition-colors">
                <Users className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Create Your Profile</h3>
              <p className="text-neutral-400 mb-6">Sign up to become part of the WWAA universe. Customize your experience and track your favorite superstars.</p>
              <Link href="/login" className="text-red-500 font-bold hover:text-red-400">Get Started &rarr;</Link>
            </div>
            <div className="bg-neutral-900 p-8 rounded-lg border border-neutral-800 hover:border-red-900 transition-colors group">
              <div className="bg-red-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-900/40 transition-colors">
                <Trophy className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Vote for Awards</h3>
              <p className="text-neutral-400 mb-6">Make your voice heard. Vote for the Wrestler of the Year, Match of the Year, and more.</p>
              <Link href="/awards" className="text-red-500 font-bold hover:text-red-400">Vote Now &rarr;</Link>
            </div>
            <div className="bg-neutral-900 p-8 rounded-lg border border-neutral-800 hover:border-red-900 transition-colors group">
              <div className="bg-red-900/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-red-900/40 transition-colors">
                <Shield className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Live Results</h3>
              <p className="text-neutral-400 mb-6">Catch the results live as they happen. Don't miss a single moment of the action.</p>
              <Link href="/awards" className="text-red-500 font-bold hover:text-red-400">See Results &rarr;</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
