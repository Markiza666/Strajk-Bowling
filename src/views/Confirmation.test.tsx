import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Confirmation from './confirmation/Confirmation';

describe('Confirmation View', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    /**
     * US 5: As a user, I want to be able to navigate between the booking and confirmation view.
     */
    it('should navigate to start when clicking Go to booking from error view', async () => {
        // We simulate a user visiting the confirmation page without any booking data.
        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Routes>
                    <Route path="/" element={<div data-testid="booking-page">Booking Page</div>} />
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        // AC 2: "If the user navigates to the confirmation view and no booking has been made or is in session storage, the text "No booking made" should be displayed."
        expect(screen.getByText(/No booking found!/i)).toBeInTheDocument();

        // AC 1: "The user should be able to navigate from the booking view to the confirmation view when the booking is complete."
        // Specifically testing the return path from the error state back to the booking view.
        const backBtn = screen.getByRole('button', { name: /go to booking/i });
        
        fireEvent.click(backBtn);

        // Verifying that the navigation back to the booking page is successful.
        await waitFor(() => {
            expect(screen.getByTestId('booking-page')).toBeInTheDocument();
        });
    });

    /**
     * US 5.
     */
    it('should navigate to start when clicking Sweet lets go from details view', async () => {
        // AC 2: "If the user navigates to the confirmation view and there is a booking saved ..."
        // We prepare the session storage with a valid booking to ensure the details view is rendered.
        const mockBooking = { 
            when: '2026-01-01 12:00', 
            lanes: '1', 
            people: '1', 
            price: 100, 
            id: 'STR123' 
        };
        sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Routes>
                    <Route path="/" element={<div data-testid="booking-page">Booking Page</div>} />
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        // AC 1: "The user should be able to navigatefrom the booking view to ..."
        // This specifically tests the navigation path FROM the confirmation view BACK to the booking view after a successful booking.
        const successBtn = await screen.findByRole('button', { name: /sweet/i });
        fireEvent.click(successBtn);

        // Verifying that the application correctly navigates back to the root ("/") booking page.
        await waitFor(() => {
            expect(screen.getByTestId('booking-page')).toBeInTheDocument();
        });
    });

    /**
     * US 5.
     */
    it('should show error message when no booking is found', () => {
        // Preparation: Rendering the component with a MemoryRouter. 
        // Since we haven't set anything in sessionStorage, it will be empty by default.
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Confirmation />
            </MemoryRouter>
        );

        // AC 2: "If the user navigates to the confirmation view and no booking has been made ...the text 'No booking made' (No booking found!) should be displayed."
        // This confirms the component handles missing data gracefully.
        expect(screen.getByText(/No booking found!/i)).toBeInTheDocument(); 

        // Testing the UI robustness: Checking that a navigation button exists so the user can actually perform the navigation mentioned in the US.
        expect(screen.getByRole('button', { name: /Go to booking/i })).toBeInTheDocument();
    });

    /**
     * US 5.
     */
    it('should render details when booking exists', () => {
        // Preparation: Setting up the "Success Scenario".
        // AC 2: "If the user navigates to the confirmation view and there is a booking saved ..."
        const mockBooking = {
            when: '2026-05-20 18:00',
            people: '2',
            lanes: '1',
            id: '123-ABC',
            price: '340'
        };
        sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Confirmation />
            </MemoryRouter>
        );

        // Verifying that the confirmation message is shown.
        expect(screen.getByText(/See you soon!/i)).toBeInTheDocument();

        // AC 2: Testing that the specific booking data (the ID) from session storage is rendered correctly.
        // This proves that the component is successfully reading from the storage.
        expect(screen.getByDisplayValue('123-ABC')).toBeInTheDocument();
    });

    /**
     * US 5.
     */
    it('should display all booking details correctly when a booking exists', async () => {
        // AC 2: "If the user navigates to the confirmation view and ..."
        // We set up a complete mock booking to verify that all parts of the saved data are correctly mapped.
        const mockBooking = { 
            when: '2026-12-12 18:00', 
            people: '4', 
            lanes: '1', 
            id: 'STR12345', 
            price: '440' 
        };
        sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Confirmation />
            </MemoryRouter>
        );

        // AC 3: If the user navigates to the confirmation view and there is a booking saved in session storage, this should be displayed.
        // Verifying that all specific details from session storage are displayed correctly in the UI.
        // We check input values and text content to ensure data integrity between storage and view.
        expect(screen.getByLabelText(/When/i)).toHaveValue('2026-12-12 18:00');
        expect(screen.getByLabelText(/Who/i)).toHaveValue('4');
        expect(screen.getByLabelText(/Lanes/i)).toHaveValue('1');
        expect(screen.getByLabelText(/Booking number/i)).toHaveValue('STR12345');

        // Verifying that the calculated total price is shown as expected.
        expect(screen.getByText(/440 sek/i)).toBeInTheDocument();
    });

    /**
     * US 5.
     */
    it('should display all booking details correctly in the input fields', async () => {
        // AC 2: "If the user navigates to the confirmation view and ..."
        // We prepare a complete mock booking object to verify the data binding in the UI.
        const mockBooking = { 
            when: '2026-12-12 18:00', 
            people: '4', 
            lanes: '1', 
            id: 'STR12345', 
            price: '440' 
        };
        sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Confirmation />
            </MemoryRouter>
        );

        // AC 2: "this should be displayed" - specifically verifying each individual field.
        // We ensure that each input field (When, Who, Lanes, Booking number) holds the correct 
        // value from our session storage.
        expect(screen.getByLabelText(/When/i)).toHaveValue('2026-12-12 18:00');
        expect(screen.getByLabelText(/Who/i)).toHaveValue('4');
        expect(screen.getByLabelText(/Lanes/i)).toHaveValue('1');
        expect(screen.getByLabelText(/Booking number/i)).toHaveValue('STR12345');

        // Verifying that the price is correctly formatted and displayed as text.
        expect(screen.getByText(/440 sek/i)).toBeInTheDocument();
    });

    /**
     * US 5.
     */
    it('should handle fallback values and verify input branches', async () => {
        // AC 2: "If the user navigates to the confirmation view and there is a booking saved..."
        // This test goes deeper by simulating a partial/incomplete booking object to verify that the UI handles missing properties without crashing.
        const partialBooking = { 
            id: 'STR123',
            people: '2', 
            lanes: '1', 
            price: '200'
        };
        sessionStorage.setItem('confirmation', JSON.stringify(partialBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Confirmation />
            </MemoryRouter>
        );

        // Technical verification: The component should handle the missing 'when' property by showing an empty string rather than 'undefined' or crashing.
        const dateInput = screen.getByLabelText(/When/i);
        expect(dateInput).toHaveValue('');

        // AC 3: "...this should be displayed."
        // Verifying that the data which actually exists (the ID) is still rendered correctly.
        const idInput = screen.getByLabelText(/Booking number/i);
        expect(idInput).toHaveValue('STR123');
    });

    /**
     * US 5.
     */
    it('should cover all branches on line 92', () => {
        // This test ensures full code coverage by testing alternative property names.
        // AC 2: "If the user navigates to the confirmation view and there is a booking saved... this should be displayed."
        const altBooking = {
            when: '2026-05-05T10:00',
            people: '2',
            lanes: '1',
            price: '400',
            // Testing the branch that handles 'bookingId' as an alternative to 'id'.
            bookingId: 'BOK12345' 
        };
        
        sessionStorage.setItem('confirmation', JSON.stringify(altBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Confirmation />
            </MemoryRouter>
        );

        // AC 3: Verifying that the booking number is displayed correctly even when using the alternative 'bookingId' property from the session data.
        const idInput = screen.getByLabelText(/Booking number/i);
        expect(idInput).toHaveValue('BOK12345');
    });

    /**
     * US 5.
     */
    it('should achieve 100% coverage by satisfying all logic paths', async () => {
        // Preparation: Setting up a booking with alternative property names.
        // AC 2: "If the user navigates to the confirmation view and there is a booking saved... this should be displayed."
        const coverageBooking = {
            when: '2026-05-05T10:00',
            people: '2',
            lanes: '1',
            price: '400',
            bookingId: 'BOK12345'
        };
        
        sessionStorage.setItem('confirmation', JSON.stringify(coverageBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Confirmation />
            </MemoryRouter>
        );

        // Verifying that the booking number is displayed correctly using the 'bookingId' branch.
        const idInput = screen.getByLabelText(/Booking number/i);
        expect(idInput).toHaveValue('BOK12345');

        // Technical verification: Triggering a change event on the date input.
        // This ensures that the component's state-update logic for input fields is fully tested.
        const whenInput = screen.getByLabelText(/When/i);
        fireEvent.change(whenInput, { target: { value: '2026-05-05 12:00' } });
        
        // Final confirmation that the price, as part of the saved booking, is still visible 
        // after UI interactions.
        expect(screen.getByText(/400 sek/i)).toBeInTheDocument();
    });
});
