import { useAuth as useSession } from '@/src/context/AuthContext';
export { AuthProvider } from '@/src/context/AuthContext';
export function useAuth() { const auth = useSession(); return { ...auth, session: auth.user, signout: auth.logout }; }
