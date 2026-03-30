import React, { useState } from 'react';
import { Shield, Lock, Calculator, DollarSign, Cpu, Type, Image as ImageIcon, Video, RefreshCw, Building2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Provider } from '../types';

interface SuperAdminProps {
  providers: Provider[];
  onAddProvider: (provider: Provider) => void;
  onDeleteProvider: (id: string) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({ providers, onAddProvider, onDeleteProvider }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Provider Form State
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderType, setNewProviderType] = useState('Corporate Training');
  const [isAdding, setIsAdding] = useState(false);

  // Calculator State (Monthly Estimates)
  const [textPosts, setTextPosts] = useState(500);
  const [avgInputTokens, setAvgInputTokens] = useState(1000); // Context + Prompt
  const [avgOutputTokens, setAvgOutputTokens] = useState(500);  // Generated Post
  const [imagePosts, setImagePosts] = useState(50);
  const [videoPosts, setVideoPosts] = useState(10);

  // Pricing Constants (Estimates based on public pricing)
  // Gemini 1.5 Flash Pricing (approximate for calculation)
  const PRICE_PER_1M_INPUT_TOKENS = 0.075; 
  const PRICE_PER_1M_OUTPUT_TOKENS = 0.30;
  
  // Media Pricing
  const PRICE_PER_IMAGE = 0.040; // Approx Gemini Pro Image
  const PRICE_PER_VIDEO = 0.15;  // Estimated Veo Preview cost

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Stoolpreston103') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProviderName.trim()) return;

    const newProvider: Provider = {
      id: `p${Date.now()}`,
      name: newProviderName,
      type: newProviderType,
      verified: true
    };

    onAddProvider(newProvider);
    setNewProviderName('');
    setIsAdding(false);
  };

  const calculateCosts = () => {
    // 1. Token Costs
    const totalInput = textPosts * avgInputTokens;
    const totalOutput = textPosts * avgOutputTokens;
    
    const inputCost = (totalInput / 1_000_000) * PRICE_PER_1M_INPUT_TOKENS;
    const outputCost = (totalOutput / 1_000_000) * PRICE_PER_1M_OUTPUT_TOKENS;
    const totalTokenCost = inputCost + outputCost;

    // 2. AI Media Costs
    const totalImageCost = imagePosts * PRICE_PER_IMAGE;
    const totalVideoCost = videoPosts * PRICE_PER_VIDEO;
    const totalMediaCost = totalImageCost + totalVideoCost;

    // 3. Base Total
    const baseCost = totalTokenCost + totalMediaCost;

    // 4. Selling Price (2x multiplier)
    const sellingPrice = baseCost * 2;

    return {
      totalTokenCost,
      totalMediaCost,
      baseCost,
      sellingPrice
    };
  };

  const costs = calculateCosts();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-50 rounded-full">
              <Lock className="w-8 h-8 text-slate-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Super Admin Access</h2>
          <p className="text-center text-slate-500 mb-6">Enter administrative credentials to proceed.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <Shield className="w-4 h-4" /> {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       {/* Header */}
       <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Shield className="text-brand-400" /> Platform Administration
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Manage training providers and calculate projected monthly costs for AI usage.
            </p>
          </div>
          {/* Decorative BG */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-600 rounded-full opacity-20 blur-3xl"></div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Provider Management & Calculator */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Provider Management */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Building2 className="text-brand-600" size={20} />
                  <h3 className="font-semibold text-slate-800">Training Providers</h3>
                </div>
                <button 
                  onClick={() => setIsAdding(!isAdding)}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  <Plus size={16} /> Add Company
                </button>
              </div>

              {isAdding && (
                <div className="p-6 bg-brand-50 border-b border-brand-100 animate-in slide-in-from-top-2 duration-200">
                  <form onSubmit={handleAddProvider} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Name</label>
                      <input 
                        type="text" 
                        required
                        value={newProviderName}
                        onChange={(e) => setNewProviderName(e.target.value)}
                        placeholder="e.g. Global Tech Inc."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Provider Type</label>
                      <select 
                        value={newProviderType}
                        onChange={(e) => setNewProviderType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                      >
                        <option>Corporate Training</option>
                        <option>Bootcamp</option>
                        <option>Higher Education</option>
                        <option>Healthcare Education</option>
                        <option>Vocational</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button 
                        type="submit"
                        className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                      >
                        Create Provider
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800">{p.name}</h4>
                          {p.verified && <CheckCircle2 size={14} className="text-brand-600" />}
                        </div>
                        <p className="text-xs text-slate-500">{p.type} • ID: {p.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteProvider(p.id)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Calculator */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                 <Calculator className="text-brand-600" size={20} />
                 <h3 className="font-semibold text-slate-800">Pricing Calculator</h3>
              </div>
              
              <div className="space-y-8">
                {/* Text Generation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <Type size={14} /> Text Generation
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Monthly Text Posts</label>
                      <span className="text-sm font-bold text-brand-600">{textPosts}</span>
                    </div>
                    <input 
                      type="range" min="0" max="5000" step="50" 
                      value={textPosts} onChange={(e) => setTextPosts(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Avg Input Tokens</label>
                      <input 
                        type="number" value={avgInputTokens} onChange={(e) => setAvgInputTokens(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Avg Output Tokens</label>
                      <input 
                        type="number" value={avgOutputTokens} onChange={(e) => setAvgOutputTokens(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Generation */}
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <ImageIcon size={14} /> Media Generation
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Monthly Images Generated</label>
                      <span className="text-sm font-bold text-pink-600">{imagePosts}</span>
                    </div>
                    <input 
                      type="range" min="0" max="1000" step="10" 
                      value={imagePosts} onChange={(e) => setImagePosts(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700">Monthly Videos Generated</label>
                      <span className="text-sm font-bold text-indigo-600">{videoPosts}</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="1" 
                      value={videoPosts} onChange={(e) => setVideoPosts(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div className="space-y-4">
             {/* Total Calculation Card */}
             <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 sticky top-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Revenue Est.</h3>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Cpu size={16} /> Token Cost
                      </div>
                      <span className="font-mono font-medium text-slate-800">{formatCurrency(costs.totalTokenCost)}</span>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <ImageIcon size={16} /> AI Media Cost
                      </div>
                      <span className="font-mono font-medium text-slate-800">{formatCurrency(costs.totalMediaCost)}</span>
                   </div>
                   <div className="border-t border-slate-200 my-2"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm font-medium">Base Cost</span>
                      <span className="font-mono font-bold text-slate-700">{formatCurrency(costs.baseCost)}</span>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-6 text-center text-white">
                   <p className="text-sm text-slate-400 uppercase tracking-widest mb-1">Recommended Price</p>
                   <div className="text-4xl font-bold flex items-center justify-center gap-1">
                      {formatCurrency(costs.sellingPrice)}
                   </div>
                   <p className="text-xs text-brand-400 mt-2 font-medium">Includes 2x Markup</p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw size={12} className="animate-spin-slow" />
                    <span>Auto-calculating based on usage</span>
                  </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
