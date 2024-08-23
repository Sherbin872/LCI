import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import "../styles/UserCard.scss";
import StarIcon from "@mui/icons-material/Star";

const UserCard = ({ user, onDelete, onToggleFeature }) => {
  const [isFeatured, setIsFeatured] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkFeaturedStatus = async () => {
      try {
        const response = await axios.get(
          `https://lci-server.onrender.com/properties/user/${user._id}`
        );
        const listings = response.data;
        const allFeatured = listings.every((listing) => listing.isFeatured);
        setIsFeatured(allFeatured);
      } catch (error) {
        console.error("Failed to check featured status:", error);
      }
    };
    checkFeaturedStatus();
  }, [user._id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
    );
    if (confirmed) {
      try {
        await axios.delete(`https://lci-server.onrender.com/users/${user._id}`);
        onDelete(user._id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleToggleFeature = async () => {
    try {
      const response = await axios.patch(
        `https://lci-server.onrender.com/properties/toggle-feature/${user._id}`
      );
      setIsFeatured(response.data.isFeatured);
      onToggleFeature(user._id);
    } catch (error) {
      console.error("Failed to toggle feature listings:", error);
    }
  };

  return (
    <div className="user-card" onClick={() => navigate(`/user/${user._id}`)}>
      <div className="user-card-content">
        <img
          src={`https://lci-server.onrender.com/${user.profileImagePath.replace(
            "public",
            ""
          )}`}
          alt={`${user.firstName} ${user.lastName}`}
          className="user-card-image"
        />
        <div className="user-card-info">
          <div className="left_u">
            <h3>
              {user.firstName} {user.lastName}
            </h3>
            <p className="email">{user.email}</p>
            <p className="p1">
              Listings: <b> {user.listingsCount}</b>
            </p>
            <p className="p2">
              Bookings:<b> {user.bookingsCount}</b>
            </p>
          </div>
          <div className="right_u">
            <button
              className="fl"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFeature();
              }}
            >
              <StarIcon style={{ fontSize: "16px" }} />

              {isFeatured ? "Unfeature Listings" : "Feature Listings"}
            </button>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <PersonRemoveIcon style={{ fontSize: "16px" }} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
