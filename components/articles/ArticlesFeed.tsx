'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Heart, MessageCircle, X, Share2, Calendar, User, ChevronRight, FileText 
} from 'lucide-react';

// --- Interfaces ---
interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  author_id?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export default function ArticlesFeed() {
  const supabase = createClient();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // استخدام (as any) لتجاوز خطأ عدم وجود الجدول في الأنواع
      const { data } = await (supabase.from('articles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setArticles(data);
        setFilteredArticles(data);
        // استخراج التصنيفات الفريدة
        const cats = ['الكل', ...Array.from(new Set(data.map((a: any) => a.category)))];
        setCategories(cats as string[]);
      }
    };
    fetchData();
  }, []);

  // 2. Filtering
  const handleFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === 'الكل') {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter(a => a.category === category));
    }
  };

  // 3. Article Interaction (Open/Close)
  const openArticle = async (article: Article) => {
    setSelectedArticle(article);
    // Fetch Comments
    const { data } = await (supabase.from('article_comments') as any)
      .select('*')
      .eq('article_id', article.id)
      .order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setComments([]);
  };

  // 4. Like & Comment Logic
  const handleLike = async (e: any, articleId: string) => {
    e.stopPropagation();
    if (!currentUser) return alert('يجب تسجيل الدخول');
    
    // ✅ تصحيح: استخدام (as any) لتجاوز خطأ never
    const { error } = await (supabase.from('article_likes') as any).insert({ 
      article_id: articleId, 
      user_id: currentUser.id 
    });
    
    if (!error) {
        // Update local count (Optimistic update)
        const updated = articles.map(a => a.id === articleId ? {...a, likes_count: (a.likes_count || 0) + 1} : a);
        setArticles(updated);
        
        // Update filtered list as well to reflect changes immediately
        if (selectedCategory === 'الكل') {
          setFilteredArticles(updated);
        } else {
          setFilteredArticles(updated.filter(a => a.category === selectedCategory));
        }
        
        // Optional: Call RPC to update count in DB if you have created the function
        // await supabase.rpc('increment_likes', { row_id: articleId });
    } else {
        // إذا كان الخطأ بسبب التكرار (Unique constraint)
        if (error.code === '23505') {
           alert('لقد أعجبت بهذا المقال مسبقاً');
        } else {
           console.error(error);
        }
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedArticle || !currentUser) return;
    
    // ✅ تصحيح: استخدام (as any) هنا أيضاً
    const { data, error } = await (supabase.from('article_comments') as any).insert({
      article_id: selectedArticle.id,
      user_id: currentUser.id,
      content: newComment
    }).select().single();

    if (data) {
      setComments([data, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="w-full dir-rtl font-cairo">
      
      {/* --- Filter Bar --- */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* --- Articles Grid (Cards) --- */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-10 text-gray-400">لا توجد مقالات حالياً</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map(article => (
            <div 
              key={article.id} 
              onClick={() => openArticle(article)}
              className="bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition group"
            >
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                {article.image_url ? (
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400"><FileText size={40}/></div>
                )}
                <span className="absolute top-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                  {article.category}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{article.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.content}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(article.created_at).toLocaleDateString('ar-EG')}</span>
                  <div className="flex gap-3">
                    <button onClick={(e) => handleLike(e, article.id)} className="flex items-center gap-1 hover:text-red-500 transition group-hover:text-red-500">
                      <Heart size={14} className={article.likes_count > 0 ? "fill-red-500 text-red-500" : ""} /> {article.likes_count || 0}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Full Article View (Modal/Overlay) --- */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-white md:bg-black/50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full md:w-[600px] bg-white h-full shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-300">
            
            {/* Header / Nav */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center z-10">
              <button onClick={closeArticle} className="p-2 hover:bg-gray-100 rounded-full bg-gray-50">
                <ChevronRight size={24} className="text-gray-700" />
              </button>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-full"><Share2 size={20}/></button>
                <button onClick={closeArticle} className="p-2 hover:bg-red-50 text-red-600 rounded-full"><X size={20}/></button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedArticle.image_url && (
                <img src={selectedArticle.image_url} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm" alt="" />
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{selectedArticle.category}</span>
                <span className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12}/> {new Date(selectedArticle.created_at).toLocaleDateString('ar-EG')}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{selectedArticle.title}</h1>
              
              <div className="prose prose-lg text-gray-700 leading-relaxed whitespace-pre-wrap font-cairo">
                {selectedArticle.content}
              </div>
            </div>

            {/* Interaction Section */}
            <div className="bg-gray-50 border-t p-6 mt-8 pb-20">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle size={18}/> التعليقات
              </h3>
              
              {/* Comment List */}
              <div className="space-y-4 mb-6">
                {comments.length === 0 && <p className="text-center text-gray-400 text-sm">كن أول المعلقين!</p>}
                {comments.map(comment => (
                  <div key={comment.id} className="bg-white p-3 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-blue-900 flex items-center gap-1"><User size={12}/> مستخدم</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="أضف تعليقك..." 
                  className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button 
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  إرسال
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
