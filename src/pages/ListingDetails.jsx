import React, { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import Loader from "../Components/Loader";
import Navbar from "../Components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../Components/Footer";
import CustomDateRangePicker from "../Components/CustomDateRangePicker";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [listing, setListing] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [dayCount, setDayCount] = useState(1);

  const { listingId } = useParams();
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `https://lci-server.onrender.com/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data.listing);
      setBookings(data.bookings);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, [listingId]);

  useEffect(() => {
    if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
      const start = new Date(dateRange[0].startDate);
      const end = new Date(dateRange[0].endDate);
      setDayCount(Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    } else {
      setDayCount(1);
    }
  }, [dateRange]);

  if (loading) {
    return <Loader />;
  }

  const isBooked = (dateRange) => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) return false;

    const start = new Date(dateRange.startDate).getTime();
    const end = new Date(dateRange.endDate).getTime();

    return bookings.some((booking) => {
      const bookingStart = new Date(booking.startDate).getTime();
      const bookingEnd = new Date(booking.endDate).getTime();

      return (
        (start >= bookingStart && start <= bookingEnd) ||
        (end >= bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  const handleSelect = (ranges) => {
    setDateRange([ranges]);
  };

  const handleSubmit = async () => {
    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * dayCount,
      };

      navigate(`/${customerId}/trips`);

      const response = await fetch(
        "https://lci-server.onrender.com/bookings/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingForm),
        }
      );
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item) => (
            <img
              key={item}
              src={`https://lci-server.onrender.com/${item.replace(
                "public",
                ""
              )}`}
              alt="listing photo"
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`https://lci-server.onrender.com/${listing.creator.profileImagePath.replace(
              "public",
              ""
            )}`}
            alt="Host profile"
          />
          <h3>
            Hosted by {listing.creator.firstName} {listing.creator.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <CustomDateRangePicker
                bookings={bookings}
                onDateChange={handleSelect}
              />
              {dayCount > 1 ? (
                <h2>
                  ${listing.price} x {dayCount} nights
                </h2>
              ) : (
                <h2>
                  ${listing.price} x {dayCount} night
                </h2>
              )}

              <h2>Total price: ${listing.price * dayCount}</h2>
              <p>Start Date: {dateRange[0]?.startDate?.toDateString()}</p>
              <p>End Date: {dateRange[0]?.endDate?.toDateString()}</p>

              <button
                className="button"
                type="submit"
                onClick={handleSubmit}
                disabled={isBooked(dateRange[0])}
              >
                {isBooked(dateRange[0]) ? "Unavailable" : "Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
