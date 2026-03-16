import "../../views/confirmation/Confirmation.scss";
import { useLocation } from "react-router-dom";

import Top from "../../components/top/Top";
import Navigation from "../../components/navigation/Navigation";
import Input from "../../components/input/Input";

interface ConfirmationDetails {
    when: string;
    people: string | number;
    lanes: string | number;
    bookingId: string;
    price: string | number;
}

interface LocationState {
    confirmationDetails: ConfirmationDetails;
}

function Confirmation() {
    const location = useLocation();
    const state = location.state as LocationState | null;

    const savedConfirmation = sessionStorage.getItem("confirmation");
    const confirmation: ConfirmationDetails | null = 
        state?.confirmationDetails || (savedConfirmation ? JSON.parse(savedConfirmation) : null);

    const noop = () => {};

    return (
        <section className="confirmation">
            <Navigation />
            <Top title="See you soon!" />
            
            {confirmation ? (
                <form className="confirmation__details" onSubmit={(e) => e.preventDefault()}>
                    <Input
                        label="When"
                        type="text"
                        name="when"
                        customClass="confirmation__input"
                        defaultValue={confirmation.when.replace("T", " ")}
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
                        defaultValue={confirmation.bookingId}
                        disabled={true}
                        handleChange={noop}
                    />
                    
                    <article className="confirmation__price">
                        <p>Total:</p>
                        <p>{confirmation.price} sek</p>
                    </article>
                    
                    <button className="button confirmation__button" type="button">
                        Sweet, let's go!
                    </button>
                </form>
            ) : (
                <h2 className="confirmation__no-booking">Ingen bokning gjord!</h2>
            )}
        </section>
    );
}

export default Confirmation;
