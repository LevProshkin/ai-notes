import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], // Тут будуть наші нотатки
  isLoading: false,
  error: null,
};

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    // Дія для додавання нової нотатки
    addNote: (state, action) => {
      state.items.unshift(action.payload);
    },
    // Дія для видалення
    deleteNote: (state, action) => {
      state.items = state.items.filter(note => note.id !== action.payload);
    },
    // Тут в майбутньому буде дія для оновлення нотатки через AI
    updateNoteContent: (state, action) => {
      const { id, newContent } = action.payload;
      const note = state.items.find(n => n.id === id);
      if (note) {
        note.content = newContent;
      }
    }
  },
});

export const { addNote, deleteNote, updateNoteContent } = notesSlice.actions;
export default notesSlice.reducer;