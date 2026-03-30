import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Scatter
} from 'recharts';
import { Target, TrendingUp, Users, MousePointerClick } from 'lucide-react';

const platformData = [
  { name: 'LinkedIn', conversions: 45, clicks: 120 },
  { name: 'Twitter', conversions: 20, clicks: 80 },
  { name: 'Facebook', conversions: 35, clicks: 150 },
  { name: 'Instagram', conversions: 50, clicks: 200 },
];

const timeData = [
  { name: 'Week 1', organic: 4000, paid: 2400 },
  { name: 'Week 2', organic: 3000, paid: 1398 },
  { name: 'Week 3', organic: 2000, paid: 9800 },
  { name: 'Week 4', organic: 2780, paid: 3908 },
];

const campaignData = [
  { name: 'Data Science', posts: 12, impressions: 45000, clicks: 3200, conversions: 150, ctr: 7.1 },
  { name: 'Leadership', posts: 8, impressions: 28000, clicks: 1800, conversions: 85, ctr: 6.4 },
  { name: 'Marketing', posts: 15, impressions: 35000, clicks: 2900, conversions: 120, ctr: 8.2 },
];

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Campaign Performance Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-slate-800">Campaign Performance</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={campaignData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} unit="%" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#82cce8" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar yAxisId="left" dataKey="conversions" name="Conversions" fill="#2596be" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR %" stroke="#f472b6" strokeWidth={3} dot={{r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* KPI Cards for Campaigns */}
          <div className="space-y-4">
            {campaignData.map((campaign) => (
              <div key={campaign.name} className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-800">{campaign.name}</h4>
                  <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                    {campaign.posts} Posts
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users size={12} /> Impressions
                    </p>
                    <p className="font-semibold text-slate-700">{(campaign.impressions / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MousePointerClick size={12} /> Conversions
                    </p>
                    <p className="font-semibold text-slate-700">{campaign.conversions}</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className="bg-brand-500 h-1.5 rounded-full" 
                    style={{ width: `${(campaign.conversions / campaign.clicks) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-right text-slate-400 mt-1">Conv. Rate</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Platform Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Platform Performance</h3>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="clicks" name="Link Clicks" fill="#82cce8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversions" name="Enrollments" fill="#2596be" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Reach: Organic vs Paid</h3>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="organic" stroke="#2596be" strokeWidth={3} dot={{r: 4}} />
                <Line type="monotone" dataKey="paid" stroke="#f472b6" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Performing Content</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Post Content</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Impressions</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3 rounded-r-lg">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">Mastering Python for Data Science...</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">LinkedIn</span></td>
                <td className="px-4 py-3">Oct 24, 2023</td>
                <td className="px-4 py-3">12,400</td>
                <td className="px-4 py-3">840</td>
                <td className="px-4 py-3 text-green-600 font-medium">6.7%</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">5 Tips for Better Leadership...</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">Twitter</span></td>
                <td className="px-4 py-3">Oct 22, 2023</td>
                <td className="px-4 py-3">8,200</td>
                <td className="px-4 py-3">320</td>
                <td className="px-4 py-3 text-green-600 font-medium">3.9%</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">New Course Alert: Project Management...</td>
                <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-700">Instagram</span></td>
                <td className="px-4 py-3">Oct 20, 2023</td>
                <td className="px-4 py-3">15,600</td>
                <td className="px-4 py-3">1,200</td>
                <td className="px-4 py-3 text-green-600 font-medium">7.6%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};