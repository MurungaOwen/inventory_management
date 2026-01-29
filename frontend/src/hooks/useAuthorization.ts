import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useAuthorization = () => {
  const { user } = useAuth();

  const checkAuthorization = (allowedRoles: UserRole[]) => {
    if (!user || !allowedRoles.includes(user.role)) {
      toast.error('Insufficient Permissions');
      return false;
    }
    return true;
  };

  return { checkAuthorization };
};
