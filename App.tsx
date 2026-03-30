import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, PenTool, BarChart3, Settings, Bell, Search, Menu, UserCircle, ShieldCheck, ChevronDown, Building2, Globe, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ContentStudio } from './components/ContentStudio';
import { Analytics } from './components/Analytics';
import { SocialAccounts } from './components/SocialAccounts';
import { SuperAdmin } from './components/SuperAdmin';
import { Schedule } from './components/Schedule';
import { CourseManager } from './components/CourseManager';
import { Course, ScheduledPost, Provider, SocialPlatform } from './types';

// --- MOCK DATA ---

const MOCK_PROVIDERS: Provider[] = [
  { id: 'p1', name: 'Acme Training Co.', type: 'Corporate Training', verified: true },
  { id: 'p2', name: 'TechStart Academy', type: 'Bootcamp', verified: true },
  { id: 'p3', name: 'HealthEd Plus', type: 'Healthcare Education', verified: false },
];

const MOCK_COURSES: Course[] = [
  // Acme Training
  { id: 'c1', providerId: 'p1', title: 'Leadership for New Managers', category: 'Business', description: 'Essential skills for transitioning from individual contributor to team leader.', students: 85, rating: 4.8 },
  { id: 'c2', providerId: 'p1', title: 'Corporate Communication', category: 'Business', description: 'Mastering internal and external communication.', students: 150, rating: 4.5 },
  // TechStart Academy
  { id: 'c3', providerId: 'p2', title: 'Advanced Data Science Bootcamp', category: 'Tech', description: 'Master Python, SQL, and Machine Learning.', students: 120, rating: 4.9 },
  { id: 'c4', providerId: 'p2', title: 'Full Stack Web Dev', category: 'Tech', description: 'React, Node, and Postgres from scratch.', students: 300, rating: 4.7 },
  // HealthEd Plus
  { id: 'c5', providerId: 'p3', title: 'CPR Certification', category: 'Healthcare', description: 'Basic life support training.', students: 500, rating: 4.9 },
];

const MOCK_POSTS: ScheduledPost[] = [
  { id: 'post1', providerId: 'p1', courseId: 'c1', platform: SocialPlatform.LINKEDIN, content: 'Join our new cohort!', scheduledDate: new Date(Date.now() + 86400000).toISOString(), status: 'scheduled' },
  { id: 'post2', providerId: 'p2', courseId: 'c3', platform: SocialPlatform.TWITTER, content: 'Data Science is the future.', scheduledDate: new Date(Date.now() + 172800000).toISOString(), status: 'scheduled' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'studio' | 'schedule' | 'analytics' | 'settings' | 'superadmin' | 'courses'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Providers state
  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('providers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_PROVIDERS;
      }
    }
    return MOCK_PROVIDERS;
  });

  // Courses state
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('courses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_COURSES;
      }
    }
    return MOCK_COURSES;
  });

  // Persist providers to local storage
  useEffect(() => {
    localStorage.setItem('providers', JSON.stringify(providers));
  }, [providers]);

  // Persist courses to local storage
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  // 'GLOBAL' implies the aggregator view (MicroCredentials.io Admin)
  const [selectedProviderId, setSelectedProviderId] = useState<string>('GLOBAL');
  
  // Initialize with local storage if available, else mock data
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem('scheduledPosts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_POSTS;
      }
    }
    return MOCK_POSTS;
  });

  // Persist to local storage whenever posts change
  useEffect(() => {
    localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
  }, [scheduledPosts]);

  // --- DERIVED DATA ---
  
  const currentProvider = providers.find(p => p.id === selectedProviderId);

  const filteredCourses = useMemo(() => {
    return selectedProviderId === 'GLOBAL' 
      ? courses 
      : courses.filter(c => c.providerId === selectedProviderId);
  }, [selectedProviderId, courses]);

  const filteredPosts = useMemo(() => {
    return selectedProviderId === 'GLOBAL'
      ? scheduledPosts
      : scheduledPosts.filter(p => p.providerId === selectedProviderId);
  }, [selectedProviderId, scheduledPosts]);

  // Aggregation Logic for Global Dashboard
  const aggregateStats = useMemo(() => {
    if (selectedProviderId !== 'GLOBAL') return null;

    const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
    const avgRating = courses.reduce((sum, c) => sum + c.rating, 0) / (courses.length || 1);
    const totalProviders = providers.length;
    
    // Sort providers by student count for leaderboard
    const topProviders = [...providers].map(p => {
      const pCourses = courses.filter(c => c.providerId === p.id);
      const students = pCourses.reduce((sum, c) => sum + c.students, 0);
      const rating = pCourses.reduce((sum, c) => sum + c.rating, 0) / (pCourses.length || 1);
      return { ...p, students, rating };
    }).sort((a, b) => b.students - a.students);

    return { totalStudents, avgRating, totalProviders, topProviders };
  }, [selectedProviderId, providers, courses]);

  const handleSchedulePost = (post: ScheduledPost) => {
    // Ensure the post is tagged with the current provider
    const postWithProvider = { ...post, providerId: selectedProviderId };
    setScheduledPosts(prev => [postWithProvider, ...prev]);
    setActiveTab('schedule');
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
        setScheduledPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddProvider = (newProvider: Provider) => {
    setProviders(prev => [...prev, newProvider]);
  };

  const handleUpdateProvider = (updatedProvider: Provider) => {
    setProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm('Are you sure you want to remove this provider? All associated data will be hidden.')) {
      setProviders(prev => prev.filter(p => p.id !== id));
      if (selectedProviderId === id) {
        setSelectedProviderId('GLOBAL');
      }
    }
  };

  const handleAddCourse = (newCourse: Course) => {
    setCourses(prev => [newCourse, ...prev]);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
               <span className="text-white font-bold text-lg">M</span>
             </div>
             {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-800">MicroPromote</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<BookOpen size={20} />} 
            label="Courses" 
            isActive={activeTab === 'courses'} 
            onClick={() => setActiveTab('courses')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<PenTool size={20} />} 
            label="Content Studio" 
            isActive={activeTab === 'studio'} 
            onClick={() => setActiveTab('studio')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<CalendarIcon size={20} />} 
            label="Schedule" 
            isActive={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
            isOpen={isSidebarOpen}
          />
          <SidebarItem 
            icon={<BarChart3 size={20} />} 
            label="Analytics" 
            isActive={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')}
            isOpen={isSidebarOpen}
          />
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
           <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            isOpen={isSidebarOpen}
          />
           <SidebarItem 
            icon={<ShieldCheck size={20} />} 
            label="Super Admin" 
            isActive={activeTab === 'superadmin'} 
            onClick={() => setActiveTab('superadmin')}
            isOpen={isSidebarOpen}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header with Provider Switcher */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>

            {/* Provider Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                {selectedProviderId === 'GLOBAL' ? (
                  <Globe className="w-4 h-4 text-brand-600" />
                ) : currentProvider?.logoUrl ? (
                  <img 
                    src={currentProvider.logoUrl} 
                    alt={currentProvider.name} 
                    className="w-5 h-5 rounded-full object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-slate-600" />
                )}
                <span className={`text-sm font-semibold ${selectedProviderId === 'GLOBAL' ? 'text-brand-700' : 'text-slate-700'}`}>
                  {currentProvider ? currentProvider.name : 'MicroCredentials.io (Global)'}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 border-b border-slate-50">
                   <button 
                    onClick={() => setSelectedProviderId('GLOBAL')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedProviderId === 'GLOBAL' ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-700'}`}
                   >
                     <Globe size={16} />
                     <div>
                       <div className="font-semibold">MicroCredentials.io</div>
                       <div className="text-[10px] opacity-70">Global Aggregator</div>
                     </div>
                   </button>
                </div>
                <div className="p-2 space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training Providers</div>
                  {providers.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedProviderId === p.id ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      {p.logoUrl ? (
                        <img 
                          src={p.logoUrl} 
                          alt={p.name} 
                          className="w-4 h-4 rounded-full object-cover border border-slate-100" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Building2 size={16} />
                      )}
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-800">
                   {selectedProviderId === 'GLOBAL' ? 'Platform Admin' : 'Provider Admin'}
                </p>
                <p className="text-xs text-slate-500">
                   {selectedProviderId === 'GLOBAL' ? 'Superuser' : 'Standard User'}
                </p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                {selectedProviderId === 'GLOBAL' ? (
                   <ShieldCheck className="w-5 h-5 text-slate-500" />
                ) : (
                   <UserCircle className="w-full h-full text-slate-400" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                {activeTab === 'dashboard' && (selectedProviderId === 'GLOBAL' ? 'Platform Aggregation' : 'Provider Dashboard')}
                {activeTab === 'courses' && 'Course Management'}
                {activeTab === 'studio' && 'Content Studio'}
                {activeTab === 'schedule' && 'Content Calendar'}
                {activeTab === 'analytics' && 'Performance Analytics'}
                {activeTab === 'settings' && 'Account Settings'}
                {activeTab === 'superadmin' && 'Admin Administration'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {activeTab === 'dashboard' && selectedProviderId === 'GLOBAL' && 'Aggregated view of all training providers and platform health.'}
                {activeTab === 'dashboard' && selectedProviderId !== 'GLOBAL' && `Managing courses and campaigns for ${currentProvider?.name}`}
                {activeTab === 'courses' && 'Import and analyze courses from your website or LMS.'}
                {activeTab === 'studio' && 'Create compelling content using AI to promote your courses.'}
                {activeTab === 'schedule' && 'Manage upcoming posts and view your publication history.'}
                {activeTab === 'analytics' && 'Deep dive into your campaign performance metrics.'}
              </p>
            </div>

            {activeTab === 'dashboard' && (
               <Dashboard 
                 recentPosts={filteredPosts} 
                 isGlobal={selectedProviderId === 'GLOBAL'}
                 aggregateStats={aggregateStats}
                 providerName={currentProvider?.name}
                 onViewCalendar={() => setActiveTab('schedule')}
               />
            )}

            {activeTab === 'courses' && (
              <CourseManager 
                courses={filteredCourses}
                currentProvider={currentProvider}
                onAddCourse={handleAddCourse}
                onDeleteCourse={handleDeleteCourse}
              />
            )}
            
            {activeTab === 'studio' && (
              <ContentStudio 
                courses={filteredCourses} 
                onSchedule={handleSchedulePost} 
                selectedProviderId={selectedProviderId}
                currentProvider={currentProvider}
              />
            )}

            {activeTab === 'schedule' && (
              <Schedule 
                posts={filteredPosts} 
                onDelete={handleDeletePost} 
                selectedProviderId={selectedProviderId}
                providers={providers}
              />
            )}

            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'settings' && (
              <SocialAccounts 
                currentProvider={currentProvider} 
                onUpdateProvider={handleUpdateProvider} 
              />
            )}
            {activeTab === 'superadmin' && (
              <SuperAdmin 
                providers={providers} 
                onAddProvider={handleAddProvider} 
                onDeleteProvider={handleDeleteProvider}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar Helper Component
const SidebarItem = ({ icon, label, isActive, onClick, isOpen }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
      isActive 
        ? 'bg-brand-50 text-brand-700 font-medium' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className={`${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </div>
    {isOpen && <span className="whitespace-nowrap">{label}</span>}
  </button>
);

export default App;