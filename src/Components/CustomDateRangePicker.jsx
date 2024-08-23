import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/CustomDateRange.scss"; // Custom styles

const CustomDateRangePicker = ({ bookings, onDateChange }) => {
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
    onDateChange(ranges.selection);
  };

  const isDateBooked = (date) => {
    return bookings.some((booking) => {
      const bookingStart = new Date(booking.startDate).getTime();
      const bookingEnd = new Date(booking.endDate).getTime();
      const checkDate = new Date(date).getTime();

      return checkDate >= bookingStart && checkDate <= bookingEnd;
    });
  };

  const customDayContent = (day) => {
    const date = day.toDateString();
    if (isDateBooked(date)) {
      return (
        <div className="booked-date">
          <span>{day.getDate()}</span>
          <div className="cross-mark">✘</div>
        </div>
      );
    }
    return <span>{day.getDate()}</span>;
  };

  return (
    <div className="custom-date-range">
      <DateRange
        ranges={dateRange}
        onChange={handleSelect}
        minDate={new Date()} // Disable past dates
        rangeColors={["#3ecf8e"]} // Custom color
        showDateDisplay={false} // Hide the default date display
        dayContentRenderer={customDayContent}
      />
    </div>
  );
};

export default CustomDateRangePicker;
