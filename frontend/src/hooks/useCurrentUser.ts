"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserService, UserData } from "@/services/userService";

export function useCurrentUser() {
    const { isAuthenticated, user: sessionUser } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        const { success, user, error } = await UserService.getMe();

        if (success && user) {
            setUserData(user);
        } else {
            setError(error || "Failed to load profile");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUser();
        } else {
            setUserData(null);
        }
    }, [isAuthenticated]);

    return {
        user: userData,
        session: sessionUser, // Access to raw auth session if needed
        isLoading,
        error,
        refetch: fetchUser,
    };
}
