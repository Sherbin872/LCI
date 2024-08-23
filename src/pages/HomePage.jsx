import Slide from "../Components/Slide";
import Navbar from "../Components/Navbar";
import Categories from "../Components/Categories";
import Listings from "../Components/Listings";
import Footer from "../Components/Footer";

export const HomePage = () => {
  return (
    <>
      <Navbar />
      <Slide />
      <Categories />
      <Listings />
      <Footer />
    </>
  );
};
