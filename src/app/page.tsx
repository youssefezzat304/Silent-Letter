import TheWord from "./_components/TheWord";
import InfoDisplayBar from "./_components/InfoDisplayBar";
import WordsPreference from "./_components/WordsPreference";

export default async function Home() {
  return (
    <main className="bg-background flex min-h-0 flex-1 flex-col justify-between">
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-10">
        <div className="flex gap-10">
          <TheWord />
        </div>
        <div>
          <WordsPreference />
        </div>
      </div>

      <footer className="w-full">
        <InfoDisplayBar />
      </footer>
    </main>
  );
}
