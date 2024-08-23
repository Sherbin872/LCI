import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import UserCard from "../Components/UserCard";
import "../styles/AdminPanel.scss";
import { useDispatch } from "react-redux";
import { setLogout } from "../redux/state";
import IconButton from "@mui/material/IconButton";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import ListIcon from "@mui/icons-material/List";
export const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [expiryDays, setExpiryDays] = useState(3); // Default expiry period in days
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsersAndSettings = async () => {
      try {
        const [usersResponse, settingsResponse] = await Promise.all([
          axios.get("https://lci-server.onrender.com/users/all"),
          axios.get("https://lci-server.onrender.com/settings/expiry-period"),
        ]);

        const usersData = usersResponse.data;
        setUsers(usersData);

        const totalListingsCount = usersData.reduce(
          (acc, user) => acc + user.listingsCount,
          0
        );
        setTotalListings(totalListingsCount);

        setExpiryDays(settingsResponse.data.expiryDays);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchUsersAndSettings();
  }, []);

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://lci-server.onrender.com/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.userDeleted) {
        dispatch(setLogout());
      } else {
        const updatedUsers = users.filter((user) => user._id !== userId);
        setUsers(updatedUsers);
        const totalListingsCount = updatedUsers.reduce(
          (acc, user) => acc + user.listingsCount,
          0
        );
        setTotalListings(totalListingsCount);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleToggleFeature = async (userId) => {
    try {
      const response = await axios.patch(
        `https://lci-server.onrender.com/users/toggle-feature/${userId}`
      );
      const updatedUsers = users.map((user) =>
        user._id === userId
          ? { ...user, isFeatured: response.data.isFeatured }
          : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to toggle feature status:", error);
    }
  };

  const handleExpiryDaysChange = (event) => {
    setExpiryDays(event.target.value);
  };

  const handleSaveExpiry = async () => {
    try {
      await axios.post(
        "https://lci-server.onrender.com/settings/expiry-period",
        {
          expiryDays: parseInt(expiryDays, 10),
        }
      );
      setEditing(false);
    } catch (error) {
      console.error("Failed to update expiry period:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="admin-panel">
        <div className="head">
          <h2>
            <DashboardIcon style={{ fontSize: "32px", marginBottom: "-2px" }} />
            Admin Panel
          </h2>
          <div className="right">
            <p>
              <GroupIcon
                style={{ fontSize: "25px", color: "black", marginRight: "5px" }}
              />
              Users:
              <span>{users.length}</span>
            </p>
            <p>
              <ListIcon
                style={{ fontSize: "28px", color: "black", marginRight: "5px" }}
              />
              Listings:
              <span>{totalListings}</span>
            </p>
          </div>
        </div>
        <div>
          <IconButton aria-label="expiry date">
            <EventIcon
              style={{ fontSize: "25px", color: "red", marginLeft: "5px" }}
            />
          </IconButton>
          <label>Listing Expiry Period: </label>
          {!editing ? (
            <span onClick={() => setEditing(true)}>
              {" "}
              <b> {expiryDays}</b> days
            </span>
          ) : (
            <div>
              <input
                type="number"
                value={expiryDays}
                onChange={handleExpiryDaysChange}
              />
              <button onClick={handleSaveExpiry}>Save</button>
            </div>
          )}
        </div>
        <div className="user-list">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onDelete={handleDelete}
              onToggleFeature={handleToggleFeature}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
