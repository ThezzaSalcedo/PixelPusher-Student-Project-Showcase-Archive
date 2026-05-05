import React, { createContext, useContext, useState } from 'react';

type DashboardSection = string;

interface DashboardNavContextValue {
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
}

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export const DashboardNavProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('repository');

  return (
    <DashboardNavContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </DashboardNavContext.Provider>
  );
};

export const useDashboardNav = () => {
  const context = useContext(DashboardNavContext);
  if (!context) {
    throw new Error('useDashboardNav must be used within a DashboardNavProvider');
  }
  return context;
};
