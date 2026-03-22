import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sparkles, Trash2, Plus, LogOut, LogIn } from 'lucide-react';

// Імпорти Firebase
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

export default function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]); // Тепер беремо нотатки з Firestore, а не з Redux

  // 1. Слідкуємо за станом авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Слідкуємо за нотатками в базі (тільки для поточного юзера)
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Сортуємо за часом (найновіші зверху)
      setNotes(notesData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return () => unsubscribe();
  }, [user]);

  // Функції авторизації
  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  // Збереження нотатки в Firestore
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    try {
      await addDoc(collection(db, 'notes'), {
        title,
        content,
        userId: user.uid,
        createdAt: serverTimestamp(),
        displayDate: new Date().toLocaleDateString()
      });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Помилка збереження:", error);
    }
  };

  // Видалення з Firestore
  const handleDeleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      console.error("Помилка видалення:", error);
    }
  };

  const handleAIMagic = async () => {
    if (!content.trim()) {
      alert("Спочатку напишіть текст!");
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('https://ai-notes-api-akun.onrender.com/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) throw new Error('Помилка сервера');
      const data = await response.json();
      setContent(data.enhancedText);
    } catch (error) {
      alert("AI тимчасово недоступний");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Якщо користувач не авторизований — показуємо екран входу
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm w-full">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">AI Smart Notes</h1>
          <p className="text-gray-500 mb-8">Увійдіть, щоб ваші нотатки зберігалися в хмарі</p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/icon_google.svg" alt="Google" className="w-5 h-5" />
            Увійти через Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Хедер з профілем */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Вітаємо,</p>
              <p className="font-bold text-sm">{user.displayName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Форма створення */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Нова нотатка
            </h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <input
                type="text"
                placeholder="Заголовок..."
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Напишіть щось..."
                className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Зберегти
                </button>
                <button
                  type="button"
                  onClick={handleAIMagic}
                  disabled={isAiLoading}
                  className={`p-2 rounded-lg transition-colors ${isAiLoading ? 'bg-gray-100 text-gray-400' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  {isAiLoading ? '...' : <Sparkles className="w-6 h-6" />}
                </button>
              </div>
            </form>
          </div>

          {/* Список нотаток */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-6">Мої нотатки ({notes.length})</h2>
            {notes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 italic">Тут поки порожньо...</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{note.title}</h3>
                    <button onClick={() => handleDeleteNote(note.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                  <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-400 uppercase tracking-widest">
                    {note.displayDate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}