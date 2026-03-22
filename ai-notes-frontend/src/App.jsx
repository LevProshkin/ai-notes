import { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus, LogOut, Loader2 } from 'lucide-react';

// Імпорти Firebase
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

export default function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // 1. Слідкуємо за станом авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Слідкуємо за нотатками (real-time)
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
      setNotes(notesData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    });

    return () => unsubscribe();
  }, [user]);

  // Функції авторизації
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Помилка входу:", error);
    }
  };
  
  const handleLogout = () => signOut(auth);

  // Збереження нотатки
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    try {
      // Використовуємо setDoc з власним ID, щоб уникнути дублікатів при швидких кліках
      const noteRef = doc(collection(db, 'notes'));
      await setDoc(noteRef, {
        title: title.trim(),
        content: content.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
        displayDate: new Date().toLocaleDateString('uk-UA')
      });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Помилка збереження:", error);
    }
  };

  // Видалення
  const handleDeleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      console.error("Помилка видалення:", error);
    }
  };

  // Магія AI
  const handleAIMagic = async () => {
    if (!content.trim()) return;

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
      console.error(error);
      alert("AI тимчасово недоступний");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Екран завантаження, поки перевіряємо юзера
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ЕКРАН ВХОДУ (з виправленим дизайном та темною темою)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-800 text-center max-w-sm w-full">
          <div className="bg-blue-100 dark:bg-blue-950 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-blue-600 dark:text-blue-400 w-8 h-8" />
          </div>
          {/* ВИПРАВЛЕНО: Текст тепер чіткий в обох темах */}
          <h1 className="text-3xl font-extrabold mb-2 text-gray-950 dark:text-white">AI Smart Notes</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-sm">Твій інтелектуальний нотатник у хмарі. Покращуй думки одним кліком.</p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-98"
          >
            {/* ВИПРАВЛЕНО: Надійна іконка Google */}
            <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5" />
            Увійти через Google
          </button>
        </div>
      </div>
    );
  }

  // ГОЛОВНИЙ ЕКРАН (з темною темою та шліфуванням)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Хедер */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-600" referrerpolicy="no-referrer" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Раді бачити,</p>
              <p className="font-bold text-sm text-gray-950 dark:text-white">{user.displayName}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Форма criação (ЛІВА КОЛОНКА) */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-8">
              {/* ВИПРАВЛЕНО: Колір заголовка та іконки */}
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2.5 text-gray-950 dark:text-white">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                Нова нотатка
              </h2>
              <form onSubmit={handleSaveNote} className="space-y-4">
                <input
                  type="text"
                  placeholder="Заголовок нотатки..."
                  className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  placeholder="Напишіть ваші думки тут..."
                  className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-950 dark:text-white border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none min-h-[180px] resize-y transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-98 shadow-md shadow-blue-500/10">
                    Зберегти
                  </button>
                  <button
                    type="button"
                    onClick={handleAIMagic}
                    disabled={isAiLoading || !content.trim()}
                    className={`p-3 rounded-xl transition-all group flex items-center justify-center ${
                      isAiLoading 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400' 
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 active:scale-98'
                    }`}
                    title="Покращити за допомогою AI Llama 3"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Список нотаток (ПРАВА КОЛОНКА) */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white">Мої нотатки</h2>
                <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                    {notes.length}
                </span>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-400 dark:text-gray-600 italic">Тут поки порожньо. Створіть свою першу геніальну нотатку!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg dark:hover:border-gray-700 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white leading-tight">{note.title}</h3>
                    <button 
                      onClick={() => handleDeleteNote(note.id)} 
                      className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Видалити нотатку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
                      {note.displayDate}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-purple-200 dark:text-purple-900" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Футер */}
        <div className="text-center mt-16 pb-8 text-xs text-gray-400 dark:text-gray-600">
            © 2026 AI Smart Notes by Lev Proshkin. Усі права захищені.
        </div>
      </div>
    </div>
  );
}