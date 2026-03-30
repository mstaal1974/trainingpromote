import React from 'react';
import { ScheduledPost, SocialPlatform, Provider } from '../types';
import { Calendar, Trash2, Image as ImageIcon, Video, CheckCircle2, Clock, AlertCircle, Building2, MoreHorizontal, Rocket } from 'lucide-react';

interface ScheduleProps {
  posts: ScheduledPost[];
  onDelete: (id: string) => void;
  selectedProviderId: string;
  providers: Provider[];
}

export const Schedule: React.FC<ScheduleProps> = ({ posts, onDelete, selectedProviderId, providers }) => {
  // Sort by date ascending
  const sortedPosts = [...posts].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const getPlatformColor = (p: SocialPlatform) => {
    switch (p) {
      case SocialPlatform.LINKEDIN: return 'bg-blue-700 text-white';
      case SocialPlatform.TWITTER: return 'bg-sky-500 text-white';
      case SocialPlatform.FACEBOOK: return 'bg-blue-600 text-white';
      case SocialPlatform.INSTAGRAM: return 'bg-pink-600 text-white';
      case SocialPlatform.GITLAB: return 'bg-orange-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const handlePublish = async (post: ScheduledPost) => {
    if (post.platform !== SocialPlatform.GITLAB) {
      alert(`Publishing to ${post.platform} is coming soon!`);
      return;
    }

    if (confirm('Do you want to publish this content to GitLab now?')) {
      try {
        // In a real app, we'd call our backend which has the GitLab token
        // For this demo, we'll simulate the API call to our backend
        const response = await fetch('/api/publish/gitlab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: post.content,
            title: `Course Promotion: ${post.id}`,
          })
        });

        if (response.ok) {
          alert('Successfully published to GitLab!');
          // In a real app, we'd update the post status to 'published'
        } else {
          const err = await response.json();
          alert(`Failed to publish: ${err.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Publish error:', error);
        alert('Failed to publish to GitLab. Please ensure your account is connected.');
      }
    }
  };

  const getProviderName = (id: string) => {
    return providers.find(p => p.id === id)?.name || 'Unknown Provider';
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    }).format(date);
  };

  const isPast = (isoString: string) => new Date(isoString) < new Date();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Content Calendar
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {selectedProviderId === 'GLOBAL' 
              ? 'Managing scheduled content across all providers.' 
              : 'View and manage your upcoming social media posts.'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 flex items-center gap-1">
            <Clock size={12} /> {posts.filter(p => !isPast(p.scheduledDate)).length} Upcoming
          </div>
          <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100 flex items-center gap-1">
            <CheckCircle2 size={12} /> {posts.filter(p => isPast(p.scheduledDate)).length} Published
          </div>
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-medium mb-1">No posts scheduled</h3>
          <p className="text-slate-500 text-sm">Use the Content Studio to create and schedule your first post.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <div 
              key={post.id} 
              className={`group bg-white p-5 rounded-xl border transition-all hover:shadow-md ${
                isPast(post.scheduledDate) ? 'border-slate-100 opacity-75' : 'border-slate-200 border-l-4 border-l-brand-500'
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Date Box */}
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {new Date(post.scheduledDate).toLocaleString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-2xl font-bold text-slate-800 leading-none">
                    {new Date(post.scheduledDate).getDate()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(post.scheduledDate).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getPlatformColor(post.platform)}`}>
                      {post.platform}
                    </span>
                    {selectedProviderId === 'GLOBAL' && (
                      <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        <Building2 size={10} /> {getProviderName(post.providerId)}
                      </span>
                    )}
                    {isPast(post.scheduledDate) ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">
                        <CheckCircle2 size={10} /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                        <Clock size={10} /> Scheduled
                      </span>
                    )}
                  </div>

                  <p className="text-slate-800 text-sm line-clamp-2 mb-3">{post.content}</p>

                  {/* Media Preview (if exists) */}
                  {post.mediaUrl && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                      <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                         {post.mediaType === 'video' ? (
                            <video src={post.mediaUrl} className="w-full h-full object-cover" />
                         ) : (
                            <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                         )}
                      </div>
                      <div className="text-xs text-slate-500 pr-2">
                        <div className="font-medium text-slate-700 flex items-center gap-1.5">
                          {post.mediaType === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                          {post.mediaType === 'video' ? 'Video Attached' : 'Image Attached'}
                        </div>
                        <span className="opacity-70">Ready to publish</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-center pl-4 border-l border-slate-100">
                  {!isPast(post.scheduledDate) && (
                    <button 
                      onClick={() => handlePublish(post)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Publish Now"
                    >
                      <Rocket size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(post.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
