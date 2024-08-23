import { useEffect, useState } from "react";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { setListings, setBookings } from "../redux/state";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const listings = useSelector((state) => state.listings);
  const bookings = useSelector((state) => state.bookings || []); // Ensure bookings is an array
  // const serverUrl = import.meta.env.VITE_SERVER_URL;

  const getFeedListings = async () => {
    try {
      const response = await fetch(
        selectedCategory !== "All"
          ? `https://lci-server.onrender.com/properties?category=${selectedCategory}`
          : `https://lci-server.onrender.com/properties`,
        {
          method: "GET",
        }
      );
      //${serverUrl}
      const data = await response.json();
      // Prioritize featured listings
      const sortedListings = data.sort((a, b) => b.isFeatured - a.isFeatured);
      dispatch(setListings({ listings: sortedListings }));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
    }
  };

  const getBookings = async () => {
    try {
      const response = await fetch("https://lci-server.onrender.com/bookings", {
        method: "GET",
      });

      const data = await response.json();
      dispatch(setBookings({ bookings: data }));
    } catch (err) {
      console.log("Fetch Bookings Failed", err.message);
    }
  };

  // Fetch listings initially and set an interval to periodically refresh them
  useEffect(() => {
    getFeedListings();
    getBookings();
    const interval = setInterval(getFeedListings, 10000); // Fetch listings every 60 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const isBooked = (listingId) => {
    return bookings.some((booking) => booking.listingId === listingId);
  };
  return (
    <>
      <div className="category-list">
        {categories?.map((category, index) => (
          <div
            className={`category ${
              category.label === selectedCategory ? "selected" : ""
            }`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="listings">
          {listings.map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              startDate,
              endDate,
              totalPrice,
              booking,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                startDate={startDate}
                endDate={endDate}
                totalPrice={totalPrice}
                booking={booking}
                isBooked={isBooked(_id)}
              />
            )
          )}
        </div>
      )}
    </>
  );
};

export default Listings;
