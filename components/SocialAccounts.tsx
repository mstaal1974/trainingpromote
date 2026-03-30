import React, { useState, useEffect, useRef } from 'react';
import { Linkedin, Facebook, Twitter, Instagram, CheckCircle2, XCircle, ExternalLink, Loader2, Gitlab, Globe, Palette, Image as ImageIcon, RefreshCw, Sparkles, Upload } from 'lucide-react';
import { SocialPlatform, Provider } from '../types';
import { analyzeWebsiteBranding } from '../services/geminiService';

interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  connected: boolean;
  username?: string;
}

interface SocialAccountsProps {
  currentProvider?: Provider;
  onUpdateProvider?: (provider: Provider) => void;
}

export const SocialAccounts: React.FC<SocialAccountsProps> = ({ currentProvider, onUpdateProvider }) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { id: '1', platform: SocialPlatform.LINKEDIN, connected: true, username: 'Acme Training Co.' },
    { id: '2', platform: SocialPlatform.TWITTER, connected: false },
    { id: '3', platform: SocialPlatform.FACEBOOK, connected: false },
    { id: '4', platform: SocialPlatform.INSTAGRAM, connected: true, username: '@acme_training' },
    { id: '5', platform: SocialPlatform.GITLAB, connected: false },
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState(currentProvider?.websiteUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.platform === 'GitLab') {
        setAccounts(prev => prev.map(a => a.platform === SocialPlatform.GITLAB ? { ...a, connected: true, username: 'GitLab User' } : a));
        setConnecting(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleToggle = async (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    if (account.connected) {
      if (confirm(`Are you sure you want to disconnect ${account.platform}?`)) {
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, connected: false, username: undefined } : a));
      }
    } else {
      if (account.platform === SocialPlatform.GITLAB) {
        setConnecting(id);
        try {
          const response = await fetch('/api/auth/url');
          if (!response.ok) throw new Error('Failed to get auth URL');
          const { url } = await response.json();
          
          window.open(url, 'oauth_popup', 'width=600,height=700');
        } catch (error) {
          console.error('OAuth error:', error);
          alert('Failed to initiate GitLab connection. Please try again.');
          setConnecting(null);
        }
      } else {
        setConnecting(id);
        // Simulate OAuth flow for others
        setTimeout(() => {
          setAccounts(prev => prev.map(a => a.id === id ? { ...a, connected: true, username: 'New User' } : a));
          setConnecting(null);
        }, 1500);
      }
    }
  };

  const handleSyncBranding = async () => {
    if (!websiteUrl || !currentProvider || !onUpdateProvider) return;
    
    setIsSyncing(true);
    try {
      const branding = await analyzeWebsiteBranding(websiteUrl);
      onUpdateProvider({
        ...currentProvider,
        websiteUrl,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        // In a real app, we might try to find the logo URL too, 
        // but for now we'll just store the description or a placeholder
      });
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync branding from website. Please ensure the URL is correct.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateColor = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    if (!currentProvider || !onUpdateProvider) return;
    onUpdateProvider({
      ...currentProvider,
      [field]: value
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentProvider || !onUpdateProvider) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      onUpdateProvider({
        ...currentProvider,
        logoUrl: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const getIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case SocialPlatform.LINKEDIN: return <Linkedin className="w-6 h-6 text-blue-700" />;
      case SocialPlatform.TWITTER: return <Twitter className="w-6 h-6 text-sky-500" />;
      case SocialPlatform.FACEBOOK: return <Facebook className="w-6 h-6 text-blue-600" />;
      case SocialPlatform.INSTAGRAM: return <Instagram className="w-6 h-6 text-pink-600" />;
      case SocialPlatform.GITLAB: return <Gitlab className="w-6 h-6 text-orange-600" />;
      default: return null;
    }
  };

  if (!currentProvider) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-100">
        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-slate-900 font-medium mb-1">No Provider Selected</h3>
        <p className="text-slate-500 text-sm">Please select a training provider from the sidebar to manage settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Branding Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-600" /> Brand Identity
            </h2>
            <p className="text-sm text-slate-500 mt-1">Customize your logo and brand colors for content generation.</p>
          </div>
          {currentProvider.primaryColor && (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" 
                style={{ backgroundColor: currentProvider.primaryColor }}
                title="Primary Color"
              />
              <div 
                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm" 
                style={{ backgroundColor: currentProvider.secondaryColor }}
                title="Secondary Color"
              />
            </div>
          )}
        </div>

        <div className="p-6 space-y-8">
          {/* Website Sync */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Website URL</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="url" 
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.yourcompany.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              <button 
                onClick={handleSyncBranding}
                disabled={isSyncing || !websiteUrl}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isSyncing ? 'Syncing...' : 'Sync Branding'}
              </button>
            </div>
            <p className="text-xs text-slate-400">Our AI will analyze your website to extract your brand colors and logo style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
            {/* Color Pickers */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Brand Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={currentProvider.primaryColor || '#0ea5e9'}
                      onChange={(e) => handleUpdateColor('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-none p-0"
                    />
                    <input 
                      type="text" 
                      value={currentProvider.primaryColor || '#0ea5e9'}
                      onChange={(e) => handleUpdateColor('primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={currentProvider.secondaryColor || '#64748b'}
                      onChange={(e) => handleUpdateColor('secondaryColor', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-none p-0"
                    />
                    <input 
                      type="text" 
                      value={currentProvider.secondaryColor || '#64748b'}
                      onChange={(e) => handleUpdateColor('secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Brand Logo</h3>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div 
                  onClick={triggerLogoUpload}
                  className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-brand-300 transition-all cursor-pointer overflow-hidden group relative"
                >
                  {currentProvider.logoUrl ? (
                    <>
                      <img src={currentProvider.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white w-5 h-5" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} />
                      <span className="text-[10px] mt-1 font-medium">Upload</span>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload your company logo (PNG or SVG preferred). This will be used in generated social media graphics.
                  </p>
                  <button 
                    onClick={triggerLogoUpload}
                    className="text-brand-600 text-xs font-semibold mt-2 hover:underline"
                  >
                    {currentProvider.logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Connected Accounts</h2>
          <p className="text-sm text-slate-500 mt-1">Manage the social media channels where you publish content.</p>
        </div>
        
        <div className="divide-y divide-slate-100">
          {accounts.map((account) => (
            <div key={account.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {getIcon(account.platform)}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{account.platform}</h3>
                  {account.connected ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Connected as {account.username}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1">
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Not connected</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleToggle(account.id)}
                disabled={connecting === account.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  account.connected 
                    ? 'border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-red-600 hover:border-red-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow'
                } ${connecting === account.id ? 'opacity-70 cursor-wait' : ''}`}
              >
                {connecting === account.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    {account.connected ? 'Disconnect' : 'Connect Account'}
                    {!account.connected && <ExternalLink className="w-4 h-4 opacity-50" />}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            MicroPromote uses official APIs to publish content. 
            <a href="#" className="text-brand-600 hover:underline ml-1">Read our Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};
