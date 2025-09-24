import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import TheWord from "./_components/TheWord";
import WordsSettings from "./_components/WordsSettings";
import InfoDisplayBar from "./_components/InfoDisplayBar";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex h-screen flex-col items-center justify-center gap-6 bg-zinc-50">
        <div className="absoluteflex gap-10">
          <TheWord />
        </div>
        <WordsSettings />
        <footer className="absolute w-full bottom-0">
          <InfoDisplayBar />
        </footer>
      </main>
    </HydrateClient>
  );
}
