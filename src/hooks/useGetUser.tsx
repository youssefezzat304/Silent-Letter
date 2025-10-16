"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "~/lib/supabase/client";

export function useGetUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: fetchedUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setUser(null);
          return;
        }

        if (!fetchedUser) {
          setUser(null);
          return;
        }

        setUser(fetchedUser);
      } catch (err) {
        console.error("Unexpected error getting user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void getUser();
  }, [supabase]);

  return { user, setUser, loading, supabase };
}
