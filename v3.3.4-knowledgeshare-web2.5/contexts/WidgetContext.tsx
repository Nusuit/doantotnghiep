
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface WidgetContextType {
  isQuickNoteVisible: boolean;
  setQuickNoteVisible: (visible: boolean) => void;
  toggleQuickNote: () => void;
}

const WidgetContext = createContext<WidgetContextType>({
  isQuickNoteVisible: true,
  setQuickNoteVisible: () => {},
  toggleQuickNote: () => {},
});

export const useWidget = () => useContext(WidgetContext);

export const WidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persist state in localStorage
  const [isQuickNoteVisible, setIsQuickNoteVisible] = useState(() => {
    const saved = localStorage.getItem('ks_widget_quicknote');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('ks_widget_quicknote', JSON.stringify(isQuickNoteVisible));
  }, [isQuickNoteVisible]);

  const toggleQuickNote = () => setIsQuickNoteVisible(!isQuickNoteVisible);

  return (
    <WidgetContext.Provider value={{ 
      isQuickNoteVisible, 
      setQuickNoteVisible: setIsQuickNoteVisible,
      toggleQuickNote 
    }}>
      {children}
    </WidgetContext.Provider>
  );
};
