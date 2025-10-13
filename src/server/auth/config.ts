import bcrypt from "bcryptjs";
import type { SupabaseUser } from "~/types/types";
import { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "~/lib/supabaseAdmin";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const { data: user } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("email", credentials.email as string)
          .single<SupabaseUser>();

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (passwordsMatch) return user;

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }

      try {
        let { data: dbUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (!dbUser) {
          const { data: newUser, error } = await supabaseAdmin
            .from("users")
            .insert({
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            })
            .select("id")
            .single();

          if (error || !newUser) {
            console.error("Error creating Google user:", error);
            return false;
          }
          dbUser = newUser;
        }

        if (dbUser) {
          await supabaseAdmin.from("accounts").upsert({
            user_id: dbUser.id,
            type: account.type,
            provider: account.provider,
            provider_account_id: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
          });
        }

        user.id = dbUser.id;
        return true;
      } catch (error) {
        console.error("Google Sign-In Callback Error:", error);
        return false;
      }
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.picture = session.user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;
