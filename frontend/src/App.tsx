import { useEffect } from "react";
import { AppRouter } from "@/routes/app-router";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useTheme } from "@/hooks/use-theme";

export default function App() {
  const { bootstrap } = useAuth();
  useTheme();
  useNotifications();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return <AppRouter />;
}
