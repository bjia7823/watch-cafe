'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Star, Link as LinkIcon, LogOut, Plus, Loader2 } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  rating: number;
  urls: { name: string; url: string }[];
  entry_time: string;
}

export default function Dashboard() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newUrls, setNewUrls] = useState([{ name: '', url: '' }]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchMovies();
      }
    };
    checkUser();
  }, [router]);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('watched_movies')
      .select('*')
      .order('entry_time', { ascending: false });
    
    if (data) setMovies(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    
    setAdding(true);
    const urlsToSave = newUrls.filter(u => u.name && u.url);
    
    const { error } = await supabase.from('watched_movies').insert([{
      title: newTitle,
      rating: newRating,
      urls: urlsToSave,
    }]);

    if (!error) {
      setNewTitle('');
      setNewRating(5);
      setNewUrls([{ name: '', url: '' }]);
      setShowAddForm(false);
      fetchMovies();
    }
    setAdding(false);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Watch Cafe</h1>
        <button onClick={handleSignOut} className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors">
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Watched Movies</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Movie</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddMovie} className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                <input 
                  type="text" required
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Inception"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Rating</label>
                <div className="flex space-x-2 items-center h-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setNewRating(star)} className={`focus:outline-none transition-colors ${newRating >= star ? 'text-yellow-400' : 'text-zinc-600'}`}>
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400">Links</label>
              {newUrls.map((urlObj, idx) => (
                <div key={idx} className="flex space-x-2">
                  <input
                    type="text" placeholder="Link Name (e.g. IMDB)"
                    value={urlObj.name}
                    onChange={(e) => {
                      const updated = [...newUrls];
                      updated[idx].name = e.target.value;
                      setNewUrls(updated);
                    }}
                    className="w-1/3 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="url" placeholder="https://..."
                    value={urlObj.url}
                    onChange={(e) => {
                      const updated = [...newUrls];
                      updated[idx].url = e.target.value;
                      setNewUrls(updated);
                    }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {idx === newUrls.length - 1 && (
                    <button type="button" onClick={() => setNewUrls([...newUrls, { name: '', url: '' }])} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg">
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button disabled={adding} type="submit" className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Movie'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">{movie.title}</h3>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < movie.rating ? 'text-yellow-400 fill-current' : 'text-zinc-700'}`} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-6">{new Date(movie.entry_time).toLocaleDateString()} at {new Date(movie.entry_time).toLocaleTimeString()}</p>
              
              {movie.urls && movie.urls.length > 0 && (
                <div className="space-y-2">
                  {movie.urls.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-indigo-400 w-fit transition-colors">
                      <LinkIcon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {movies.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              No movies watched yet. Time to add one!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
