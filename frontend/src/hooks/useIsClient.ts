import { useEffect, useState } from "react";

/**
 * Hook to detect if code is running on the client side
 * Useful for preventing SSR hydration mismatches
 * @returns boolean - true if running on client, false if on server
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export default useIsClient;
