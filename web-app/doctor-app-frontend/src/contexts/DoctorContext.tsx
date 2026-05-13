import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getDoctorProfile, type DoctorProfile } from '../services/doctorService';

interface DoctorContextType {
  profile: DoctorProfile | null;
  profileLoading: boolean;
  refreshProfile: () => void;
}

const DoctorContext = createContext<DoctorContextType>({
  profile: null,
  profileLoading: true,
  refreshProfile: () => {},
});

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const load = () => {
    setProfileLoading(true);
    getDoctorProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  };

  useEffect(load, []);

  return (
    <DoctorContext.Provider value={{ profile, profileLoading, refreshProfile: load }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctorContext() {
  return useContext(DoctorContext);
}
