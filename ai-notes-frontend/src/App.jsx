import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addNote, deleteNote } from './store/notesSlice';
import { Sparkles, Trash2, Plus } from 'lucide-react'; // Іконки

export default function App() {
  // Усі хуки знаходяться СТРОГО всередині компонента
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const notes = useSelector((state) => state.notes.items);
  const dispatch = useDispatch();

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNote = {
      id: Date.now().toString(), // Тимчасовий ID
      title,
      content,
      createdAt: new Date().toLocaleDateString(),
    };

    dispatch(addNote(newNote));
    setTitle('');
    setContent('');
  };

  const handleAIMagic = async () => {
    if (!content.trim()) {
      alert("Спочатку напишіть якийсь текст у полі, щоб AI міг його покращити!");
      return;
    }

    setIsAiLoading(true); // Вмикаємо індикатор завантаження

    try {
      // Робимо запит на наш бекенд
      const response = await fetch('http://localhost:5000/api/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });

      if (!response.ok) {
        throw new Error('Помилка сервера');
      }

      const data = await response.json();

      // Замінюємо текст у полі на покращений від AI
      setContent(data.enhancedText);

    } catch (error) {
      console.error("Помилка:", error);
      alert("Не вдалося зв'язатися з AI. Перевірте, чи працює бекенд-сервер.");
    } finally {
      setIsAiLoading(false); // Вимикаємо індикатор
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ЛІВА КОЛОНКА: Форма створення */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Нова нотатка
          </h2>
          <form onSubmit={handleSaveNote} className="space-y-4">
            <input
              type="text"
              placeholder="Заголовок..."
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Напишіть свої думки тут..."
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[150px] resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex gap-2">
              {/* Повернули кнопку "Зберегти" */}
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Зберегти
              </button>
              
              {/* Кнопка "Магія AI" */}
              <button
                type="button"
                onClick={handleAIMagic}
                disabled={isAiLoading}
                className={`flex items-center justify-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors ${
                  isAiLoading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                }`}
                title="Покращити текст за допомогою AI"
              >
                {isAiLoading ? 'Думаю...' : <Sparkles className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>

        {/* ПРАВА КОЛОНКА: Список нотаток */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Мої нотатки</h2>

          {notes.length === 0 ? (
            <p className="text-gray-500 italic text-center py-10">У вас поки немає нотаток. Створіть першу!</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  <button
                    onClick={() => dispatch(deleteNote(note.id))}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                <span className="text-xs text-gray-400 mt-4 block">{note.createdAt}</span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}