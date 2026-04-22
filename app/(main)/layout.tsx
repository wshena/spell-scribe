import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MainContainer from "@/components/ui/containers/MainContainer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainContainer>
      <Navbar />
      {children}
      <Footer />
    </MainContainer>
  )
}