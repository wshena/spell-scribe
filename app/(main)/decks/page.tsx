import ContentContainer from "@/components/ui/containers/ContentContainer";

export default function YourDecksPage() {
  return (
    <main className="w-full pt-28 pb-16">
      <ContentContainer>
        <section className="rounded-lg border border-white/10 bg-[#121820] p-8 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Your Deck</p>
          <h1 className="mt-3 text-3xl font-semibold">Deck workspace</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            This space is ready for saved brews, revisions, and deck snapshots.
          </p>
        </section>
      </ContentContainer>
    </main>
  );
}
