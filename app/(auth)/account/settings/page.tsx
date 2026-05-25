import ContentContainer from "@/components/ui/containers/ContentContainer";

export const metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences.",
  keywords: [
    "MTG deck",
    "Magic: The Gathering",
    "deck building",
    "card collection",
  ],
  openGraph: {
    title: `Account Settings | SpellScribe`,
    description: `Manage your account settings and preferences.`,
    type: "website",
  },
};

const page = () => {
  return (
    <main className="min-h-screen bg-[#0b0f14] pt-28 pb-16 text-white">
      <ContentContainer>
        <section className="">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Profile settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            This area is ready for profile preferences, connected sessions, and
            account details.
          </p>
        </section>
      </ContentContainer>
    </main>
  );
};

export default page;
