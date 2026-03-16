import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Booking.scss";

import BookingInfo from "../../components/bookingInfo/BookingInfo";
import ErrorMessage from "../../components/error/ErrorMessage";
import Navigation from "../../components/navigation/Navigation";
import Shoes from "../../components/shoes/Shoes";
import Top from "../../components/top/Top";

interface Shoe {
  id: string;
  size: string;
}

interface BookingDetails {
  when: string;
  time: string;
  lanes: number;
  people: number;
}

interface BookingPayload {
  when: string;
  lanes: number;
  people: number;
  shoes: string[];
}

function Booking() {
    const [booking, setBooking] = useState<BookingDetails>({
        when: "",
        time: "",
        lanes: 0,
        people: 0,
    });
    const [shoes, setShoes] = useState<Shoe[]>([]);
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    function updateBookingDetails(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setError("");

        setBooking((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    function updateSize(event: ChangeEvent<HTMLInputElement>) {
        const { value, name } = event.target;
        setError("");

        if (value.length === 2 || value.length === 0) {
            setShoes((prevState) =>
                prevState.map((shoe) =>
                shoe.id === name ? { ...shoe, size: value } : shoe
                )
            );
        }
    }

    function addShoe(id: string) {
        setError("");
        setShoes([...shoes, { id: id, size: "" }]);
    }

    function removeShoe(id: string) {
        setError("");
        setShoes(shoes.filter((shoe) => shoe.id !== id));
    }

    function isShoeSizesFilled(): boolean {
        return shoes.every((shoe) => shoe.size.length > 0);
    }

    function checkPlayersAndLanes(): boolean {
        const MAX_PLAYERS_PER_LANE = 4;
        const maxPlayersAllowed = booking.lanes * MAX_PLAYERS_PER_LANE;
        return booking.people <= maxPlayersAllowed;
    }

    async function sendBooking(bookingInfo: BookingPayload) {
        const response = await fetch(
        "https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking",
            {
                method: "POST",
                headers: {
                    "x-api-key": "strajk-B2mWxADrthdHqd22",
                },
                body: JSON.stringify(bookingInfo),
            }
        );

        if (!response.ok) {
            throw new Error("Could not send the booking");
        }

        return await response.json();
    }

    async function book() {
        let errorMessage = "";

        if (!booking.when || booking.lanes < 1 || !booking.time || booking.people < 1) {
            errorMessage = "All fields must be filled in.";
        } else if (parseInt(booking.people.toString()) !== shoes.length) {
            errorMessage = "The number of shoes must match the number of players.";
        } else if (!isShoeSizesFilled()) {
            errorMessage = "All shoes must be filled in";
        } else if (!checkPlayersAndLanes()) {
            errorMessage = "There can be a maximum of 4 players per course.";
        }

        if (errorMessage) {
            setError(errorMessage);
            return;
        }

        const bookingInfo = {
            when: `${booking.when}T${booking.time}`,
            lanes: parseInt(booking.lanes.toString()),
            people: parseInt(booking.people.toString()),
            shoes: shoes.map((shoe) => shoe.size),
        };

        try {
            const confirmation = await sendBooking(bookingInfo);
            sessionStorage.setItem("confirmation", JSON.stringify(confirmation.bookingDetails));
            
            navigate("/confirmation", {
                state: { confirmationDetails: confirmation.bookingDetails },
            });
        } catch {
            setError("A technical error occurred during booking. Please check your internet connection.");
        }
    }

    return (
        <section className="booking">
            <Navigation />
            <Top title="Booking" />
            <BookingInfo updateBookingDetails={updateBookingDetails} />
            <Shoes
                updateSize={updateSize}
                addShoe={addShoe}
                removeShoe={removeShoe}
                shoes={shoes}
            />
            <button className="button booking__button" onClick={book} type="button">
                strIIIIIke!
            </button>
            {error ? <ErrorMessage message={error} /> : ""}
        </section>
    );
}

export default Booking;
