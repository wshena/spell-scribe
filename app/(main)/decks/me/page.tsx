import ContentContainer from "@/components/ui/containers/ContentContainer";
import React from "react";

const page = () => {
  return (
    <main className="w-full pt-28 pb-16 bg-[#121820]">
      <ContentContainer>
        <section className="text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">
            Deck Collections
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Freshly Brewed Decks</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Looking for fresh inspiration? Check out the latest decks cooked up
            by the community. Use the filters to find the exact format, colors,
            or strategy you need, and grab a brand-new list for your next game
            night!
          </p>
        </section>

        {/* deck list */}
        <div className="mt-10">
          <h1>hello</h1>
        </div>
      </ContentContainer>
    </main>
  );
};

export default page;
