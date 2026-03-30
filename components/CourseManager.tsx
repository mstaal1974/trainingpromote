import React, { useState } from 'react';
import { Course, Provider } from '../types';
import { Plus, Link as LinkIcon, Loader2, Trash2, ExternalLink, BookOpen, Users, Star, Target, CheckCircle2 } from 'lucide-react';
import { analyzeCourseUrl } from '../services/geminiService';

interface CourseManagerProps {
  courses: Course[];
  currentProvider: Provider | undefined;
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ courses, currentProvider, onAddCourse, onDeleteCourse }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeCourseUrl(url);
      const newCourse: Course = {
        id: Math.random().toString(36).substr(2, 9),
        providerId: currentProvider?.id || '',
        title: data.title,
        category: data.category,
        description: data.description,
        students: 0,
        rating: 0,
        url: url,
        learningObjectives: data.learningObjectives,
        targetAudience: data.targetAudience
      };
      onAddCourse(newCourse);
      setIsAdding(false);
      setUrl('');
    } catch (err: any) {
      setError(err.message || "Failed to analyze course. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Course Catalog</h2>
          <p className="text-sm text-slate-500">Manage and analyze your training programs.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-all shadow-sm"
        >
          <Plus size={18} />
          Add Course via URL
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <LinkIcon size={18} className="text-brand-600" />
            Link New Course
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Course Page URL</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="https://your-lms.com/courses/advanced-python"
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !url}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze & Add'
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              <p className="text-slate-400 text-[10px] mt-2 italic">
                AI will crawl the page to extract title, description, learning objectives, and target audience.
              </p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setIsAdding(false)}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No courses yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">Add your first course by pasting a URL to your training page.</p>
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold uppercase rounded mb-2">
                      {course.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{course.title}</h3>
                  </div>
                  <button 
                    onClick={() => onDeleteCourse(course.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{course.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Users size={16} />
                    <span className="text-xs">{course.students.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs">{course.rating.toFixed(1)} Rating</span>
                  </div>
                </div>

                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Learning Objectives
                    </h4>
                    <ul className="space-y-1">
                      {course.learningObjectives.slice(0, 3).map((obj, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-brand-500 mt-0.5">•</span>
                          <span className="line-clamp-1">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {course.targetAudience && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Target size={12} /> Target Audience
                    </h4>
                    <p className="text-xs text-slate-600 italic">{course.targetAudience}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  {course.url && (
                    <a 
                      href={course.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink size={12} />
                      View Course Page
                    </a>
                  )}
                  <span className="text-[10px] text-slate-400">ID: {course.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
