import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [role, setRole] = useState(null);

  const lastSessionUserIdRef = useRef(null);

  useEffect(() => {
    console.log("AUTH PROVIDER INITIALIZED");
    let isMounted = true;

    const checkSessionAndLoadProfile = async (currentSession) => {
      if (!currentSession) {
        console.log("AUTH FAILED");
        if (isMounted) {
          setUser(null);
          setSession(null);
          setShop(null);
          setRole(null);
          localStorage.removeItem('userId');
          localStorage.removeItem('shopId');
          localStorage.removeItem('userRole');
          localStorage.removeItem('accessToken');
          lastSessionUserIdRef.current = null;
          setLoading(false);
        }
        return;
      }

      console.log("SESSION FOUND");
      const auth_user_id = currentSession.user.id;

      // Prevent duplicate profile fetches and infinite loops
      if (lastSessionUserIdRef.current === auth_user_id) {
        if (isMounted) {
          setSession(currentSession);
          setLoading(false);
        }
        return;
      }

      try {
        console.log("FETCHING USER PROFILE");
        // Fetch user profile from public.users using auth_user_id
        const profile = await authService.getUserProfile(auth_user_id);

        if (!profile) {
          console.warn("Session exists but user profile is missing");
          console.log("AUTH FAILED");
          
          // Safe logout and cleanup
          await authService.logout();
          localStorage.removeItem('userId');
          localStorage.removeItem('shopId');
          localStorage.removeItem('userRole');
          
          if (isMounted) {
            setUser(null);
            setSession(null);
            setShop(null);
            setRole(null);
            lastSessionUserIdRef.current = null;
          }
          return;
        }

        console.log("USER PROFILE LOADED");

        // Fetch linked shop from public.shop
        let shopData = null;
        if (profile.shop_id) {
          const { data, error } = await supabase
            .from('shop')
            .select('*')
            .eq('id', profile.shop_id)
            .maybeSingle();

          if (error) {
            console.error("Shop fetch failed:", error.message);
          } else {
            shopData = data;
            console.log("SHOP LOADED");
          }
        }

        if (isMounted) {
          const mappedUser = {
            ...currentSession.user,
            ...profile,
            name: profile.full_name, // maintain compatibility with Navbar.jsx
          };

          // Mark as successfully loaded before state updates to prevent race conditions
          lastSessionUserIdRef.current = auth_user_id;

          setUser(mappedUser);
          setSession(currentSession);
          setShop(shopData);
          setRole(profile.role);

          // Save to localStorage for api.js compatibility
          localStorage.setItem('userId', auth_user_id);
          if (profile.shop_id) {
            localStorage.setItem('shopId', profile.shop_id);
          }
          localStorage.setItem('userRole', profile.role || 'staff');
          localStorage.setItem('accessToken', currentSession.access_token);

          console.log("AUTH LOADING COMPLETE");
        }
      } catch (err) {
        console.error("Authentication setup failed:", err);
        console.log("AUTH FAILED");
        // Safe clear states
        localStorage.removeItem('userId');
        localStorage.removeItem('shopId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('accessToken');
        if (isMounted) {
          setUser(null);
          setSession(null);
          setShop(null);
          setRole(null);
          lastSessionUserIdRef.current = null;
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initialize by fetching current session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        checkSessionAndLoadProfile(initialSession);
      }
    }).catch((err) => {
      console.error("Failed to get initial session:", err);
      console.log("AUTH FAILED");
      if (isMounted) {
        setLoading(false);
      }
    });

    // Listen to supabase.auth.onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`onAuthStateChange event: ${event}`);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (isMounted) {
          setLoading(true);
          checkSessionAndLoadProfile(currentSession);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("AUTH FAILED");
        localStorage.removeItem('userId');
        localStorage.removeItem('shopId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('accessToken');
        if (isMounted) {
          setUser(null);
          setSession(null);
          setShop(null);
          setRole(null);
          lastSessionUserIdRef.current = null;
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signin = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Sign in error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Alias login function to support login({ email, password })
  const login = async (params) => {
    if (params && typeof params === 'object' && params.email) {
      return signin(params.email, params.password);
    }
    return signin(params);
  };

  // Sign up SaaS owner (creates owner user + new shop)
  const signupOwner = async (data) => {
    setLoading(true);
    try {
      const res = await authService.signupOwner(data);
      return res;
    } catch (err) {
      console.error("Signup owner error:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out the current user and clear states
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      localStorage.removeItem('userId');
      localStorage.removeItem('shopId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessToken');
      lastSessionUserIdRef.current = null;
      setUser(null);
      setSession(null);
      setShop(null);
      setRole(null);
      setLoading(false);
      console.log("AUTH FAILED");
    }
  };

  const value = {
    user,
    session,
    loading,
    shop,
    role,
    signin,
    login,
    signupOwner,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
