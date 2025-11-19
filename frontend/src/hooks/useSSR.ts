import { useState, useEffect } from "react";

export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export const useSSRSafe = (clientValue: any, serverValue: any = null) => {
  const isClient = useIsClient();
  return isClient ? clientValue : serverValue;
};
