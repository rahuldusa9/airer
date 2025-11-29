import { create } from 'zustand';

const useCharacterStore = create((set) => ({
  characters: [],
  selectedCharacter: null,
  loading: false,
  
  setCharacters: (characters) => set({ characters }),
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
  setLoading: (loading) => set({ loading }),
  
  addCharacter: (character) => set((state) => ({
    characters: [character, ...state.characters],
  })),
  
  updateCharacterInList: (id, updates) => set((state) => ({
    characters: state.characters.map((char) =>
      char.id === id ? { ...char, ...updates } : char
    ),
    selectedCharacter: state.selectedCharacter?.id === id
      ? { ...state.selectedCharacter, ...updates }
      : state.selectedCharacter,
  })),
  
  removeCharacter: (id) => set((state) => ({
    characters: state.characters.filter((char) => char.id !== id),
    selectedCharacter: state.selectedCharacter?.id === id ? null : state.selectedCharacter,
  })),
}));

export default useCharacterStore;
