import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import MainContainer from "@/components/ui/containers/MainContainer";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainContainer>
      <Navbar />
      {children}
      <Footer />
    </MainContainer>
  );
};

export default layout;
