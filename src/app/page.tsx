import TheWord from "./_components/TheWord";
import InfoDisplayBar from "./_components/InfoDisplayBar";
import TimerLoadingBar from "./_components/ui/TimerLoadingBar";
import WordsPreference from "./_components/WordsPreference";

export default async function Home() {
  // const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-6 bg-zinc-100 dark:bg-zinc-800">
      <div className="absoluteflex gap-10">
        <TheWord />
      </div>
      <WordsPreference />
      <footer className="absolute bottom-0 w-full">
        <TimerLoadingBar />
        <InfoDisplayBar />
      </footer>
    </main>
  );
}
