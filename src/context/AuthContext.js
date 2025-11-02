import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { authApi } from '../api';
import { persistentStorage, storageKeys } from '../api/client';

const AuthContext = createContext(null);

const initialState = {
  token: null,
  user: null,
  roles: [],
  username: null,
  loading: false,
  initializing: false,
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({ ...initialState, initializing: true });

  const setAuthState = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleLoginOrRegister = useCallback(async (authCall, payload) => {
    setAuthState({ loading: true });
    try {
      const response = await authCall(payload);
      const token = response?.token;
      const username = response?.username;
      const roles = Array.isArray(response?.roles) ? response.roles : [];

      if (!token || !username) {
        throw new Error('Respuesta inválida del servidor');
      }

      await persistentStorage.setItem(storageKeys.token, token);
      await persistentStorage.setItem(storageKeys.username, username);
      await persistentStorage.setItem(storageKeys.roles, JSON.stringify(roles));

      const profile = await authApi.me(token);

      setAuthState({
        token,
        username,
        roles,
        user: profile,
        loading: false,
        initializing: false,
      });
      return profile;
    } catch (error) {
      console.error('Auth error', error);
      setAuthState({ loading: false });
      throw error;
    }
  }, [setAuthState]);

  const login = useCallback((username, password) => {
    return handleLoginOrRegister(authApi.login, { username, password });
  }, [handleLoginOrRegister]);

  const register = useCallback((payload) => {
    return handleLoginOrRegister(authApi.register, payload);
  }, [handleLoginOrRegister]);

  const refreshProfile = useCallback(async () => {
    if (!state.token) {
      return null;
    }
    try {
      const profile = await authApi.me(state.token);
      setAuthState({ user: profile });
      return profile;
    } catch (error) {
      console.error('Refresh profile failed', error);
      return null;
    }
  }, [setAuthState, state.token]);

  const logout = useCallback(async () => {
    await persistentStorage.removeItem(storageKeys.token);
    await persistentStorage.removeItem(storageKeys.username);
    await persistentStorage.removeItem(storageKeys.roles);
    setState({ ...initialState, initializing: false });
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedToken, storedUsername, storedRoles] = await Promise.all([
          persistentStorage.getItem(storageKeys.token),
          persistentStorage.getItem(storageKeys.username),
          persistentStorage.getItem(storageKeys.roles),
        ]);

        if (!isMounted) {
          return;
        }

        if (storedToken && storedUsername) {
          try {
            const profile = await authApi.me(storedToken);
            if (!isMounted) {
              return;
            }
            let restoredRoles = [];
            if (storedRoles) {
              try {
                const parsed = JSON.parse(storedRoles);
                if (Array.isArray(parsed)) {
                  restoredRoles = parsed;
                }
              } catch (error) {
                console.warn('Failed to parse stored roles', error);
              }
            }
            setAuthState({
              token: storedToken,
              username: storedUsername,
              user: profile,
              roles: restoredRoles,
              initializing: false,
            });
          } catch (error) {
            console.error('Failed to restore auth session', error);
            await persistentStorage.removeItem(storageKeys.token);
            await persistentStorage.removeItem(storageKeys.username);
            await persistentStorage.removeItem(storageKeys.roles);
            if (isMounted) {
              setAuthState({ initializing: false });
            }
          }
          return;
        }

        setAuthState({ initializing: false });
      } catch (error) {
        console.error('Auth storage error', error);
        if (isMounted) {
          setAuthState({ initializing: false });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setAuthState, state.roles]);

  const value = useMemo(() => ({
    token: state.token,
    user: state.user,
    username: state.username,
    roles: state.roles,
    isAuthenticated: Boolean(state.token),
    loading: state.loading,
    initializing: state.initializing,
    login,
    register,
    refreshProfile,
    logout,
    setAuthError: (message) => Alert.alert('Autenticación', message),
    setUser: (user) => setAuthState({ user }),
  }), [state, login, register, refreshProfile, logout, setAuthState]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
