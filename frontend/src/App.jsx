import { useAtom } from "jotai";
import { useEffect } from "react";
import { userAtom } from "./atoms/authAtom";
import MainView from "./components/MainView";
import { supabase } from "./supabase/client";

function App() {
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <div>
      <MainView />
    </div>
  );
}

export default App;
