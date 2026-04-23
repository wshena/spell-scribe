import ContentContainer from "@/components/ui/containers/ContentContainer";

export default function CollectionPage() {
  return (
    <main className="w-full pt-28 pb-16">
      <ContentContainer>
        <section className="rounded-lg border border-white/10 bg-[#121820] p-8 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Collection</p>
          <h1 className="mt-3 text-3xl font-semibold">Collection overview</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Track what you own, review staples, and shape upgrades from a single inventory view.
          </p>
        </section>
      </ContentContainer>
    </main>
  );
}
