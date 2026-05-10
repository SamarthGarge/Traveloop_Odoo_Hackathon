import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  ArrowLeft,
  Search,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
} from 'lucide-react';

export default function Community() {
  const navigate = useNavigate();
  const { communityPosts, likePost } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');

  const filteredPosts = communityPosts.filter((post) => {
    const matchSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = !filter || post.destination.toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  const destinations = [...new Set(communityPosts.map((p) => p.destination))];

  return (
    <div className="min-h-screen bg-[#f4f4f0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Community</h1>
          <button className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            Share Experience
          </button>
        </div>

        {/* Community Intro */}
        <div className="bg-[#00202a] rounded-xl p-6 mb-6 text-white">
          <h2 className="text-lg font-semibold mb-2">Join the conversation</h2>
          <p className="text-white/70 text-sm">
            Share your travel experiences, discover hidden gems, and get inspired by fellow travelers.
            Use the search, filter, and sort options to find content that interests you.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiences..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffcc66] text-sm"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffcc66]"
            >
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#1a1a1a]">{post.author}</span>
                    <span className="text-gray-400 text-sm">{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#5b7f74] mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {post.destination}
                  </div>
                  <h3 className="font-semibold text-[#1a1a1a] mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => likePost(post.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5b7f74] transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Comment
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5b7f74] transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
