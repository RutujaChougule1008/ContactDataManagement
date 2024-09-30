// ContactContext.js

import React, { createContext, useContext, useState } from 'react';

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);

  return (
    <ContactContext.Provider value={{ selectedContacts, setSelectedContacts }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactProvider");
  }
  return context;
};
