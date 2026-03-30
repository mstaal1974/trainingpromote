import React, { useState, useEffect } from 'react';
import { Course, SocialPlatform, ScheduledPost, Provider } from '../types';
import { generatePostContent, generateImage, generateVideo, refinePostContent } from '../services/geminiService';
import { Sparkles, Calendar, Image as ImageIcon, Send, RefreshCw, Loader2, Video, Type, AlertCircle, Building2, Wand2, Minimize2, Maximize2, Smile, AlignLeft, Clock, LayoutTemplate, Rocket, Star, Tag, BookOpen, Camera } from 'lucide-react';

interface ContentStudioProps {
  courses: Course[];
  onSchedule: (post: ScheduledPost) => void;
  selectedProviderId: string;
  currentProvider?: Provider;
}

type MediaType = 'text' | 'image' | 'video';
type ImageSize = '1K' | '2K' | '4K';
type VideoRatio = '16:9' | '9:16';

const POST_TEMPLATES = [
  { id: 'standard', name: 'Standard Promo', icon: LayoutTemplate, description: 'General course promotion' },
  { id: 'launch', name: 'New Launch', icon: Rocket, description: 'Announce a new course' },
  { id: 'spotlight', name: 'Student Story', icon: Star, description: 'Highlight student success' },
  { id: 'sale', name: 'Flash Sale', icon: Tag, description: 'Urgent discount offer' },
  { id: 'tip', name: 'Edu-Tip', icon: BookOpen, description: 'Share a quick lesson' },
  { id: 'bts', name: 'Behind Scenes', icon: Camera, description: 'Company culture & process' },
];

export const ContentStudio: React.FC<ContentStudioProps> = ({ courses, onSchedule, selectedProviderId, currentProvider }) => {
  // Global Selection
  const [activeTab, setActiveTab] = useState<MediaType>('text');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Update selected course when courses list changes (e.g. provider switch)
  useEffect(() => {
    if (courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    } else {
      setSelectedCourseId('');
    }
  }, [courses]);

  // Text State
  const [platform, setPlatform] = useState<SocialPlatform>(SocialPlatform.LINKEDIN);
  const [tone, setTone] = useState<string>('Professional');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [generatedText, setGeneratedText] = useState<string>('');
  
  // Media State
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [videoRatio, setVideoRatio] = useState<VideoRatio>('16:9');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string>('');
  const [generatedMediaType, setGeneratedMediaType] = useState<'image' | 'video' | null>(null);

  // Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState(false);

  // -- BLOCK GLOBAL ADMIN --
  if (selectedProviderId === 'GLOBAL') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] bg-white rounded-xl border border-slate-100 shadow-sm p-10 text-center">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-slate-400" />
         </div>
         <h2 className="text-xl font-bold text-slate-800 mb-2">Select a Provider</h2>
         <p className="text-slate-500 max-w-md mb-6">
           The Content Studio is designed for specific training providers to create campaigns. 
           Please select a specific provider from the top header to start generating content.
         </p>
         <div className="text-sm bg-brand-50 text-brand-700 px-4 py-2 rounded-lg border border-brand-100 font-medium">
           Use the dropdown in the top navigation bar.
         </div>
      </div>
    );
  }

  const checkApiKey = async () => {
    // @ts-ignore - Assuming window.aistudio is available per instructions
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setApiKeyError(true);
        return false;
      }
    }
    setApiKeyError(false);
    return true;
  };

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setApiKeyError(false);
      }
    } catch (e) {
      console.error("Failed to select key", e);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiKeyError(false);

    try {
      if (activeTab === 'text') {
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) return;
        
        // Find template details to pass to generator
        const templateObj = POST_TEMPLATES.find(t => t.id === selectedTemplate);
        const templateDesc = templateObj ? `${templateObj.name}: ${templateObj.description}` : undefined;

        const metadataContext = `
          Learning Objectives: ${course.learningObjectives?.join(', ') || 'N/A'}
          Target Audience: ${course.targetAudience || 'N/A'}
        `;

        const content = await generatePostContent(
          course.title, 
          `${course.description}\n\n${metadataContext}`, 
          platform, 
          tone,
          templateDesc
        );
        setGeneratedText(content);
      } else {
        // Check if Paid Key is REQUIRED (Video OR High Res Image)
        const isPremiumFeature = activeTab === 'video' || (activeTab === 'image' && (imageSize === '2K' || imageSize === '4K'));
        
        if (isPremiumFeature) {
          const hasKey = await checkApiKey();
          if (!hasKey) {
            setIsGenerating(false);
            return;
          }
        }
        
        // Validation handled by button state, but good to have here
        if (!mediaPrompt.trim()) {
          throw new Error("Please enter a prompt describing what you want to generate.");
        }

        if (activeTab === 'image') {
          const url = await generateImage(mediaPrompt, imageSize);
          setGeneratedMediaUrl(url);
          setGeneratedMediaType('image');
        } else if (activeTab === 'video') {
          const url = await generateVideo(mediaPrompt, videoRatio);
          setGeneratedMediaUrl(url);
          setGeneratedMediaType('video');
        }
      }
    } catch (err: any) {
      const errMsg = (err.message || "").toLowerCase();
      // Check for standardized API key error from service
      if (errMsg.includes("api key expired") || errMsg.includes("invalid")) {
        setApiKeyError(true);
      } else {
        console.error(err);
        alert(err.message || "Generation failed. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!generatedText) return;
    setIsRefining(true);
    try {
      const refined = await refinePostContent(generatedText, instruction);
      setGeneratedText(refined);
    } catch (err: any) {
      const errMsg = (err.message || "").toLowerCase();
      if (errMsg.includes("api key expired") || errMsg.includes("invalid")) {
        setApiKeyError(true);
      } else {
        console.error(err);
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleSchedule = () => {
    if ((!generatedText && !generatedMediaUrl) || !scheduledDate) return;
    
    // Save properly as ISO string for backend/storage consistency
    const isoDate = new Date(scheduledDate).toISOString();

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      courseId: selectedCourseId,
      platform,
      content: generatedText || "Check out this media!",
      mediaUrl: generatedMediaUrl,
      mediaType: generatedMediaType || undefined,
      scheduledDate: isoDate,
      status: 'scheduled',
      providerId: selectedProviderId // Add current provider
    };

    onSchedule(newPost);
    // Reset
    setGeneratedText('');
    setGeneratedMediaUrl('');
    setGeneratedMediaType(null);
    setScheduledDate('');
    alert('Post scheduled successfully!');
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const course = courses.find(c => c.id === selectedCourseId);

  // Disable generation if:
  // 1. Is already generating
  // 2. No courses available
  // 3. Tab is image/video AND media prompt is empty
  const isGenerateDisabled = isGenerating || courses.length === 0 || (
    (activeTab === 'image' || activeTab === 'video') && !mediaPrompt.trim()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Left: Controls */}
      <div className="space-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-slate-800">AI Content Studio</h2>
          </div>

          <div className="space-y-5">
            {/* Context Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
              {courses.length > 0 ? (
                <select 
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500 py-2.5 px-3"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-50 text-slate-500 text-sm rounded-lg border border-slate-200">
                  No courses found for this provider.
                </div>
              )}
            </div>

            {/* Mode Tabs */}
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Type size={16} /> Text
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'image' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ImageIcon size={16} /> Image
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'video' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Video size={16} /> Video
              </button>
            </div>

            {/* Dynamic Controls based on Tab */}
            {activeTab === 'text' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Platform & Tone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                    <select 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                      className="w-full rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500 py-2.5 px-3"
                    >
                      {Object.values(SocialPlatform).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
                    <select 
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500 py-2.5 px-3"
                    >
                      <option>Professional</option>
                      <option>Exciting</option>
                      <option>Urgent</option>
                      <option>Educational</option>
                      <option>Casual</option>
                    </select>
                  </div>
                </div>

                {/* Templates Grid */}
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-3">Choose a Template</label>
                   <div className="grid grid-cols-2 gap-3">
                     {POST_TEMPLATES.map((t) => (
                       <button
                         key={t.id}
                         onClick={() => setSelectedTemplate(t.id)}
                         className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                           selectedTemplate === t.id 
                             ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200' 
                             : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                         }`}
                       >
                         <div className={`p-1.5 rounded-md ${selectedTemplate === t.id ? 'bg-white text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                            <t.icon size={16} />
                         </div>
                         <div>
                            <div className={`text-sm font-medium ${selectedTemplate === t.id ? 'text-brand-700' : 'text-slate-700'}`}>
                              {t.name}
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                              {t.description}
                            </div>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {(activeTab === 'image' || activeTab === 'video') && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {activeTab === 'image' ? 'Image Prompt' : 'Video Prompt'}
                  </label>
                  <textarea 
                    value={mediaPrompt}
                    onChange={(e) => setMediaPrompt(e.target.value)}
                    placeholder={`Describe the ${activeTab} you want to generate...`}
                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500 p-3 h-24 resize-none"
                  />
                </div>

                {activeTab === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image Size</label>
                    <div className="flex gap-3">
                      {['1K', '2K', '4K'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setImageSize(size as ImageSize)}
                          className={`flex-1 py-2 text-sm border rounded-lg transition-colors ${imageSize === size ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {imageSize !== '1K' && (
                       <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-1">
                          <Star size={10} /> 2K and 4K require a connected billing account.
                       </p>
                    )}
                  </div>
                )}

                {activeTab === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setVideoRatio('16:9')}
                        className={`flex-1 py-2 text-sm border rounded-lg transition-colors ${videoRatio === '16:9' ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        16:9 Landscape
                      </button>
                      <button
                        onClick={() => setVideoRatio('9:16')}
                        className={`flex-1 py-2 text-sm border rounded-lg transition-colors ${videoRatio === '9:16' ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        9:16 Portrait
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message for API Key */}
            {apiKeyError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertCircle size={16} />
                  <span>Authentication Required</span>
                </div>
                <p className="text-xs text-red-600">
                  Your API key is missing, invalid, or has expired. Please connect a valid Google Cloud API key to continue.
                </p>
                <button 
                  onClick={handleSelectKey}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-800 py-1.5 px-3 rounded-md self-start font-medium transition-colors"
                >
                  Connect API Key
                </button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-red-500 underline hover:text-red-700">
                  View Billing Documentation
                </a>
              </div>
            )}

            <div className="pt-2">
               <button 
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {activeTab === 'video' ? 'Generating Video (this takes time)...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {activeTab === 'text' ? 'Copy' : activeTab === 'image' ? 'Image' : 'Video'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Manual Edits & Schedule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
          {isRefining && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
               <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-lg border border-slate-100">
                 <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                 <span className="text-sm font-medium text-slate-600">Refining content...</span>
               </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-slate-800">Final Schedule</h3>
          </div>
          
          <textarea 
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            placeholder="Post caption will appear here..."
            className="w-full h-32 rounded-lg border-slate-200 text-sm focus:ring-brand-500 focus:border-brand-500 p-3 resize-none mb-3"
          />

          {/* AI Refinement Toolbar */}
          {activeTab === 'text' && generatedText && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button 
                onClick={() => handleRefine("Make it more professional and polished")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium transition-colors border border-slate-200"
              >
                <Wand2 size={12} /> Polish
              </button>
              <button 
                onClick={() => handleRefine("Make it shorter and more concise")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium transition-colors border border-slate-200"
              >
                <Minimize2 size={12} /> Shorten
              </button>
              <button 
                onClick={() => handleRefine("Expand with more details and benefits")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium transition-colors border border-slate-200"
              >
                <Maximize2 size={12} /> Expand
              </button>
              <button 
                onClick={() => handleRefine("Add relevant emojis")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium transition-colors border border-slate-200"
              >
                <Smile size={12} /> Emojify
              </button>
            </div>
          )}

          <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Clock size={12} /> Publishing Schedule
             </label>
             <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input 
                   type="datetime-local" 
                   min={getMinDateTime()}
                   value={scheduledDate}
                   onChange={(e) => setScheduledDate(e.target.value)}
                   className="w-full rounded-lg border-slate-200 text-sm py-2 px-3 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
                  />
                </div>
                <button 
                  onClick={handleSchedule}
                  disabled={(!generatedText && !generatedMediaUrl) || !scheduledDate}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div 
        className="rounded-xl p-8 flex flex-col items-center justify-center border border-slate-200 overflow-hidden relative transition-colors duration-500"
        style={{ 
          backgroundColor: currentProvider?.primaryColor ? `${currentProvider.primaryColor}10` : '#f1f5f9',
          borderColor: currentProvider?.primaryColor ? `${currentProvider.primaryColor}30` : '#e2e8f0'
        }}
      >
        <h3 className="text-slate-500 font-medium mb-6 uppercase tracking-widest text-xs z-10">
           {platform} Preview
        </h3>
        
        <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 z-10 flex flex-col max-h-full">
          {/* Mock Social Header */}
          <div className="p-4 border-b border-slate-50 flex items-center gap-3 flex-shrink-0">
             {currentProvider?.logoUrl ? (
               <img 
                 src={currentProvider.logoUrl} 
                 alt={currentProvider.name} 
                 className="w-10 h-10 rounded-full object-cover border border-slate-100"
                 referrerPolicy="no-referrer"
               />
             ) : (
               <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 flex items-center justify-center">
                 <Building2 className="w-5 h-5 text-slate-400" />
               </div>
             )}
             <div>
               <div className="text-sm font-bold text-slate-900 leading-none mb-1">
                 {currentProvider?.name || 'Provider Name'}
               </div>
               <div className="text-[10px] text-slate-500">
                 {currentProvider?.websiteUrl ? new URL(currentProvider.websiteUrl).hostname : 'provider.com'}
               </div>
             </div>
             <div className="ml-auto text-slate-300">•••</div>
          </div>
          
          {/* Content Body */}
          <div className="overflow-y-auto">
            <div className="p-4 space-y-2">
              {generatedText ? (
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {generatedText}
                </p>
              ) : (
                <div className="space-y-2 opacity-30">
                  <div className="h-2 bg-slate-200 rounded w-full" />
                  <div className="h-2 bg-slate-200 rounded w-full" />
                  <div className="h-2 bg-slate-200 rounded w-3/4" />
                </div>
              )}
            </div>

            {/* Media Area */}
            {generatedMediaUrl ? (
              <div className="w-full border-t border-slate-100 bg-slate-900 flex items-center justify-center">
                {generatedMediaType === 'image' ? (
                  <img src={generatedMediaUrl} alt="Generated content" className="w-full h-auto max-h-80 object-contain" />
                ) : (
                  <video src={generatedMediaUrl} controls className="w-full h-auto max-h-80" />
                )}
              </div>
            ) : (
              <div className="h-48 bg-slate-50 flex flex-col items-center justify-center text-slate-400 border-t border-slate-100">
                 {activeTab === 'video' ? <Video className="w-8 h-8 mb-2 opacity-50" /> : <ImageIcon className="w-8 h-8 mb-2 opacity-50" />}
                 <span className="text-xs text-center px-4">
                   {isGenerating 
                     ? 'Creating your masterpiece...' 
                     : `Generated ${activeTab === 'video' ? 'video' : 'image'} will appear here`}
                 </span>
              </div>
            )}
          </div>

           {/* Social Actions */}
           <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between text-slate-400 flex-shrink-0">
              <div className="h-4 w-4 bg-slate-300 rounded" />
              <div className="h-4 w-4 bg-slate-300 rounded" />
              <div className="h-4 w-4 bg-slate-300 rounded" />
              <div className="h-4 w-4 bg-slate-300 rounded" />
           </div>
        </div>
      </div>
    </div>
  );
};