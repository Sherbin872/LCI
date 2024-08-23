import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "../styles/UserDetail.scss";

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `https://lci-server.onrender.com/users/${userId}`
        );
        setUser(userResponse.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    const fetchUserListings = async () => {
      try {
        const listingsResponse = await axios.get(
          `https://lci-server.onrender.com/users/${userId}/properties`
        );
        setListings(listingsResponse.data);
      } catch (error) {
        console.error("Failed to fetch user listings:", error);
      }
    };

    fetchUserData();
    fetchUserListings();
  }, [userId]);

  const handleDeleteListing = async (listingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (confirmed) {
      try {
        await axios.delete(
          `https://lci-server.onrender.com/listings/${listingId}`
        );
        setListings(listings.filter((listing) => listing._id !== listingId));
      } catch (error) {
        console.error("Failed to delete listing:", error);
      }
    }
  };
  console.log(user);

  return (
    <div>
      <Navbar />
      <div className="user-detail">
        {user && (
          <div className="user-info">
            <img
              src={`https://lci-server.onrender.com/${user.profileImagePath.replace(
                "public",
                ""
              )}`}
              alt={`${user.firstName} ${user.lastName}`}
              className="user-profile-image"
            />
            <h2>
              {user.firstName} {user.lastName}
            </h2>
            <p>Email: {user.email}</p>
            <p>Listings: {user.listingsCount}</p>
          </div>
        )}

        <h2>
          <i>User Listings </i>
        </h2>
        <div className="user-listings">
          <div className="listings">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div key={listing._id} className="listing-card">
                  <img
                    src={`https://lci-server.onrender.com/${listing.listingPhotoPaths[0].replace(
                      "public",
                      ""
                    )}`}
                    alt={listing.title}
                    className="listing-image"
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  />
                  <div className="listing-card-content">
                    <h3>{listing.title}</h3>
                    <p>
                      {listing.city}, {listing.province}, {listing.country}
                    </p>
                    <p>{listing.price} per night</p>
                    <p>
                      {listing.isBooked
                        ? "Status: Booked"
                        : "Status: Available"}
                    </p>
                    <button onClick={() => handleDeleteListing(listing._id)}>
                      Delete Listing
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No listings available.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDetail;
