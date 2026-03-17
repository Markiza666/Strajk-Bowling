import "../../views/confirmation/Confirmation.scss";
import { useLocation, useNavigate } from "react-router-dom";

import Top from "../../components/top/Top";
import Navigation from "../../components/navigation/Navigation";
import Input from "../../components/input/Input";

interface ConfirmationDetails {
    when: string;
    people: string | number;
    lanes: string | number;
    id?: string;
    bookingId?: string;
    price: string | number;
}

interface LocationState {
    confirmationDetails: ConfirmationDetails;
}

function Confirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState | null;

    const savedConfirmation = sessionStorage.getItem("confirmation");

    let parsedConfirmation: ConfirmationDetails | null = null;
    if (savedConfirmation && savedConfirmation !== "undefined") {
        try {
            parsedConfirmation = JSON.parse(savedConfirmation);
        } catch (e) {
            console.error("Failed to parse confirmation data", e);
        }
    }

    const confirmation: ConfirmationDetails | null = state?.confirmationDetails || parsedConfirmation;

    const noop = () => {};

    if (!confirmation || (!confirmation.id && !confirmation.bookingId)) {
        return (
            <section className="confirmation">
                <Navigation />
                <Top title="See you soon!" />
                <article className="confirmation__no-booking">
                    <h2 className="confirmation__message">Ingen bokning gjord!</h2>
                    <button className="button" onClick={() => navigate('/')}>Gå till bokning</button>
                </article>
            </section>
        );
    }

    return (
        <section className="confirmation">
            <Navigation />
            <Top title="See you soon!" />
            
            <form className="confirmation__details" onSubmit={(e) => e.preventDefault()}>
                <Input
                    label="When"
                    type="text"
                    name="when"
                    customClass="confirmation__input"
                    defaultValue={confirmation.when?.replace("T", " ") || ""}
                    disabled={true}
                    handleChange={noop}
                />
                <Input
                    label="Who"
                    type="text"
                    name="people"
                    customClass="confirmation__input"
                    defaultValue={confirmation.people}
                    disabled={true}
                    handleChange={noop}
                />
                <Input
                    label="Lanes"
                    type="text"
                    name="lanes"
                    customClass="confirmation__input"
                    defaultValue={confirmation.lanes}
                    disabled={true}
                    handleChange={noop}
                />
                <Input
                    label="Booking number"
                    type="text"
                    name="bookingId"
                    customClass="confirmation__input"
                    defaultValue={confirmation.id || confirmation.bookingId || ""}
                    disabled={true}
                    handleChange={noop}
                />
                
                <article className="confirmation__price">
                    <p>Total:</p>
                    <p>{confirmation.price} sek</p>
                </article>
                
                <button 
                    className="button confirmation__button" 
                    type="button" 
                    onClick={() => navigate('/')}
                >
                    Sweet, let's go!
                </button>
            </form>
        </section>
    );
}

export default Confirmation;
