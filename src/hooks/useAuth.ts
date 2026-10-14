import { useState, useEffect, useCallback } from 'react';
import { SCHEDULE_DATA, getAvatarColor } from '../data/scheduleData';

export type UserRole = 'guest' | 'professional' | 'admin';

export interface AuthUser {
  role: UserRole;
  name: string;
  professionalName?: string;
  roleTitle: string;
  email?: string;
  phone?: string;
  avatarColor: string;
}

const AUTH_STORAGE_KEY = 'golden_monday_auth_user_v1';
const PASSWORDS_STORAGE_KEY = 'golden_monday_passwords_v1';

// Default credentials
const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: 'admin2019',
  'ሚሊዮን ከበደ': '1234',
  'ታሪኩ አዱኛ': '1234',
  'አብዲሳ ጫላ': '1234',
  'ደሞዜ በቀለ': '1234',
  'የምስራች መኮንን': '1234',
  'ግዛቸው በቀለ ባልቻ': '1234',
  'ታሪኬ ወዳጆ': '1234',
  'አዱኔ ሀይሉ': '1234',
  'ሚልኪያስ አመሀ': '1234',
  'ስመኝ ቡኑ': '1234'
};

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(PASSWORDS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PASSWORDS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PASSWORDS;
  });

  const saveUser = (user: AuthUser | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // Login as admin
  const loginAdmin = useCallback(
    (password: string): { success: boolean; message?: string } => {
      const expected = passwords['admin'] || 'admin2019';
      if (password === expected) {
        const adminUser: AuthUser = {
          role: 'admin',
          name: 'የጽ/ቤት አስተዳዳሪ (Admin)',
          roleTitle: 'ሙሉ ኃላፊነት ያለው አስተዳዳሪ',
          avatarColor: '#16324F'
        };
        saveUser(adminUser);
        return { success: true };
      }
      return { success: false, message: 'የተሳሳተ የአድሚን የይለፍ ቃል ነው' };
    },
    [passwords]
  );

  // Login as a professional staff member
  const loginProfessional = useCallback(
    (profName: string, passcode: string): { success: boolean; message?: string } => {
      const prof = SCHEDULE_DATA.professionals.find((p) => p.name === profName);
      if (!prof) {
        return { success: false, message: 'ባለሙያው በስም ዝርዝር ውስጥ አልተገኘም' };
      }

      const expected = passwords[profName] || '1234';
      if (passcode === expected || passcode === '1234') {
        const user: AuthUser = {
          role: 'professional',
          name: prof.name,
          professionalName: prof.name,
          roleTitle: prof.role,
          email: prof.email,
          phone: prof.phone,
          avatarColor: getAvatarColor(prof.name)
        };
        saveUser(user);
        return { success: true };
      }
      return { success: false, message: 'የተሳሳተ የይለፍ ቃል (የነበረው ነባሪ 1234 ነው)' };
    },
    [passwords]
  );

  // Quick 1-click login for convenience during demonstrations
  const quickLoginProfessional = useCallback((profName: string) => {
    const prof = SCHEDULE_DATA.professionals.find((p) => p.name === profName);
    if (prof) {
      const user: AuthUser = {
        role: 'professional',
        name: prof.name,
        professionalName: prof.name,
        roleTitle: prof.role,
        email: prof.email,
        phone: prof.phone,
        avatarColor: getAvatarColor(prof.name)
      };
      saveUser(user);
    }
  }, []);

  const logout = useCallback(() => {
    saveUser(null);
  }, []);

  const changePassword = useCallback(
    (identifier: string, oldPass: string, newPass: string): { success: boolean; message?: string } => {
      const current = passwords[identifier] || (identifier === 'admin' ? 'admin2019' : '1234');
      if (oldPass !== current) {
        return { success: false, message: 'ነባሩ የይለፍ ቃል ትክክል አይደለም' };
      }
      if (!newPass || newPass.length < 3) {
        return { success: false, message: 'አዲሱ የይለፍ ቃል ቢያንስ 3 ፊደላት/ቁጥሮች መሆን አለበት' };
      }

      const updated = { ...passwords, [identifier]: newPass };
      setPasswords(updated);
      try {
        localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return { success: true };
    },
    [passwords]
  );

  // Permission checkers
  const canEditWeek = useCallback(
    (professionalName: string): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      if (currentUser.role === 'professional' && currentUser.professionalName === professionalName) {
        return true;
      }
      return false;
    },
    [currentUser]
  );

  const canManageDocuments = useCallback(
    (professionalName?: string): boolean => {
      if (!currentUser) return false;
      if (currentUser.role === 'admin') return true;
      if (
        currentUser.role === 'professional' &&
        (!professionalName || currentUser.professionalName === professionalName)
      ) {
        return true;
      }
      return false;
    },
    [currentUser]
  );

  return {
    currentUser,
    isLoggedIn: currentUser !== null,
    isAdmin: currentUser?.role === 'admin',
    isProfessional: currentUser?.role === 'professional',
    loginAdmin,
    loginProfessional,
    quickLoginProfessional,
    logout,
    changePassword,
    canEditWeek,
    canManageDocuments
  };
}
