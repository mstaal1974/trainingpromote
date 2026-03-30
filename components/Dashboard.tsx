import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ScheduledPost, SocialPlatform } from '../types';
import { Users, MousePointer2, TrendingUp, Calendar, Image as ImageIcon, Video, Award, Building2, Globe, Star } from 'lucide-react';

interface DashboardProps {
  recentPosts: ScheduledPost[];
  isGlobal: boolean;
  providerName?: string;
  aggregateStats?: any;
  onViewCalendar: () => void;
}

const data = [
  { name: 'Mon', engagement: 2400, reach: 4000 },
  { name: 'Tue', engagement: 1398, reach: 3000 },
  { name: 'Wed', engagement: 9800, reach: 2000 },
  { name: 'Thu', engagement: 3908, reach: 2780 },
  { name: 'Fri', engagement: 4800, reach: 1890 },
  { name: 'Sat', engagement: 3800, reach: 2390 },
  { name: 'Sun', engagement: 4300, reach: 3490 },
];

export const Dashboard: React.FC<DashboardProps> = ({ recentPosts, isGlobal, aggregateStats, providerName, onViewCalendar }) => {
  
  // -- GLOBAL ADMIN VIEW --
  if (isGlobal && aggregateStats) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Aggregated Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Globe size={60} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Platform Trust Score</p>
              <h3 className="text-3xl font-bold mt-1 flex items-center gap-2">
                 {aggregateStats.avgRating.toFixed(1)} <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2 block">Aggregated from {aggregateStats.totalProviders} providers</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Students</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{aggregateStats.totalStudents.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <span className="text-xs font-medium text-green-600 mt-2 block">Active Learners</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Training Providers</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{aggregateStats.totalProviders}</h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 mt-2 block">Verified Partners</span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Campaigns</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{recentPosts.length}</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <span className="text-xs font-medium text-green-600 mt-2 block">System-wide Activity</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Global Reach Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-slate-800">Total Network Reach</h3>
               <span className="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full font-medium">All Providers</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorReachGlobal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2596be" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2596be" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#2596be" strokeWidth={3} fillOpacity={1} fill="url(#colorReachGlobal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Providers Leaderboard */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <Award className="text-yellow-500" size={20} /> Top Providers
            </h3>
            <div className="space-y-4">
               {aggregateStats.topProviders.map((provider: any, index: number) => (
                 <div key={provider.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-slate-100 text-slate-600' :
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-semibold text-slate-800">{provider.name}</h4>
                       <p className="text-xs text-slate-500">{provider.type}</p>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold text-slate-800">{provider.students}</div>
                       <div className="text-[10px] text-slate-400">Students</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -- INDIVIDUAL PROVIDER VIEW (Original View) --
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Reach</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">124.5K</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
          </div>
          <span className="text-xs font-medium text-green-600 mt-2 block">↑ 12% from last week</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Link Clicks</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">8,432</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <MousePointer2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <span className="text-xs font-medium text-green-600 mt-2 block">↑ 5.4% from last week</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Engagement</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">4.2%</h3>
            </div>
            <div className="p-2 bg-pink-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <span className="text-xs font-medium text-red-500 mt-2 block">↓ 0.8% from last week</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Scheduled Posts</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{recentPosts.length}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 mt-2 block">Next post in 2 hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-slate-800">Engagement Overview</h3>
             {providerName && <span className="text-xs text-slate-500 font-medium">{providerName}</span>}
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2596be" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2596be" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="reach" stroke="#2596be" strokeWidth={3} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Schedule</h3>
          <div className="space-y-4">
            {recentPosts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No posts scheduled.</p>
            ) : (
              recentPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 transition-all">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    post.platform === SocialPlatform.LINKEDIN ? 'bg-blue-600' :
                    post.platform === SocialPlatform.TWITTER ? 'bg-sky-400' :
                    post.platform === SocialPlatform.INSTAGRAM ? 'bg-pink-500' : 'bg-blue-800'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{post.platform}</span>
                      <div className="flex items-center gap-2">
                         {post.mediaType === 'image' && <ImageIcon size={12} className="text-slate-400" />}
                         {post.mediaType === 'video' && <Video size={12} className="text-slate-400" />}
                         <span className="text-xs text-slate-400">
                           {new Date(post.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{post.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={onViewCalendar}
            className="w-full mt-4 text-sm text-brand-600 font-medium hover:text-brand-700"
          >
            View Full Calendar
          </button>
        </div>
      </div>
    </div>
  );
};