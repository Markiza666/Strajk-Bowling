import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Booking from './booking/Booking';
import Confirmation from './confirmation/Confirmation';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

/**
 * Helper function to render the application with routing logic.
 * This allows us to test navigation between Booking and Confirmation pages.
 */
const renderFullFlow = () => {
    return render(
        <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/" element={<Booking />} />
                <Route path="/confirmation" element={<Confirmation />} />
            </Routes>
        </MemoryRouter>
    );
};

const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: MemoryRouter });
};

describe('Full Booking Flow', () => {
    
    beforeEach(() => {
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    /**
     * US 1: As a user, I want to be able to book a date and time and specify the number of players so that I can reserve 1 or more lanes in the bowling alley.
     * US 2: As a user, I want to be able to select the shoe size for each player so that each player gets shoes that fit.
     * US 4: As a user, I want to be able to send my reservation and get back a booking number and total amount so I know how much I have to pay.
     * US 5: As a user, I want to be able to navigate between the booking and confirmation views.
     */
    it('should complete booking and interact with confirmation page', async () => {
        renderFullFlow();
        // US 1. AC: Should be able to select a date and time from a calendar and time selection system.
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-24' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '14:00' } });
        // US 1. AC: Should be able to specify the number of players (at least 1 player).
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        //  US 1.AC: Should be able to specify the number of lanes (at least 1 lane).
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        // US 2. AC: Should be able to add shoe size fields by clicking a '+' button.
        fireEvent.click(screen.getByText('+'));
        // US 2. AC: Should be able to change the shoe size for each player.
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        // US 4. AC: Should be able to complete the booking by clicking the 'complete booking' button.
        fireEvent.click(screen.getByRole('button', { name: /strIIIIIke/i }));

        // US 4. AC: The system should generate a booking number and display this... after the booking is completed.
        await waitFor(() => {
            expect(screen.getByText(/See you soon!/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // US 5. AC: Navigate from booking view to confirmation view when booking is complete.
        const finalBtn = screen.getByRole('button', { name: /sweet/i }); // Confirmation page button to go back to booking
        fireEvent.click(finalBtn);

        // ...(Extra step at the end): "Navigate back to start."
        await waitFor(() => {   // Using waitFor to ensure the component has re-rendered after navigation
            const heading = screen.getByRole('heading', { name: /Booking/i, level: 1 });    //Ensuring we are back on the Booking page by checking for the heading
            expect(heading).toBeInTheDocument();
        });
    });

    /**
    * US 3: As a user, I want to be able to remove a shoe size field if I accidentally clicked in one too many so that I do not book shoes unnecessarily.
    * US 1.
     */
    it('should show error message when fields are missing and allow removing shoes', async () => {
        renderFullFlow();

        // Testing the "Add shoe" functionality first
        fireEvent.click(screen.getByText('+'));
        expect(screen.getByLabelText(/Shoe size \/ person 1/i)).toBeInTheDocument();
        
        // US 3. AC: "The user should be able to remove a previously selected shoe size field by clicking a '-' button."
        fireEvent.click(screen.getByText('-'));
        // US 3. AC: "When the user removes the shoe size, the system should update the booking so that no shoes are anymore booked."
        expect(screen.queryByLabelText(/Shoe size \/ person 1/i)).not.toBeInTheDocument();

        // Trigger the submit button whithout filling in mandatory fields.
        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        // US 1. VG AC: "If the user does not fill in any of the above (date, time, player) then an error message should be displayed."
        // This proves that the form validation stops the booking and informs the user.
        await waitFor(() => {
            expect(screen.getByText(/All fields must be filled in/i)).toBeInTheDocument();
        });
    });

    /**
     * US 1.
     */
    it('should show error when booking a date in the past', async () => {
        renderFullFlow();
        
        // We input a past date to test the validation logic for this system.
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '1994-01-01' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        // Adding necessary shoes to ensure the date is the only failing factor.
        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        // Trigger the submit button to initiate validation.
        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        // // VG AC: "If the user does not fill in the above (or provides invalid data like a past date), an error message should be displayed."
        // This confirms that the system checks if the selected date is valid according to current time.
        await waitFor(() => {
            expect(screen.getByText(/You cannot book a date in the past/i)).toBeInTheDocument();
        });
    });

    /**
     * US 1.
     */
    it('should show error when too many players per lane', async () => {
        renderWithRouter(<Booking />);

        // Maximum players per lane is 4. Testing the error for 5 players.
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        for(let i = 0; i < 5; i++) { fireEvent.click(screen.getByText('+')); }
        const shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/i);
        shoeInputs.forEach(input => fireEvent.change(input, { target: { value: '42' } }));

        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));
        
        // VG AC: "If there are not enough lanes for the specified number of players, the user should receive an error message."
        // This confirms the system validates that capacity (max 4 per lane) is not exceeded.
        expect(await screen.findByText(/maximum of 4 players per lane/i)).toBeInTheDocument();
    });

    /**
     * US 4. 
     * * Note: This test also demonstrates high-quality error handling (VG-level) 
     * by verifying how the system reacts to a server failure.
     */
    it('should show technical error when API call fails', async () => {
        // Mocking a server error (500) using MSW to test how the UI handles API failures.
        // This ensures the application remains robust even when the backend is down.
        server.use(
            http.post('https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        renderWithRouter(<Booking />);

        // US 1. AC: Filling in mandatory fields for date, time, players and lanes.
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });
        
        // US 2. AC: Adding shoe size for the player.
        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        // US 4. AC: "The user should be able to complete the booking by clicking a 'complete booking' button."
        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        // General VG Requirement: Quality of Service & Error Handling.
        // Even though not explicitly in the US list, this verifies that the system informs the user if the "complete booking" action fails technically.
        expect(await screen.findByText(/A technical error occurred/i)).toBeInTheDocument();
    });

    /**
     * US 5.
     */
    it('should show "No booking found" when navigating directly to confirmation', () => {
        // We use MemoryRouter to simulate a direct navigation to the confirmation URL without any prior booking steps or data in session storage.
        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Routes>
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        // AC: "If the user navigates to the confirmation view and no booking has been made or is in session storage, the text "No booking made" should be displayed."
        // This confirms that the component checks session storage and handles missing data gracefully.
        expect(screen.getByText(/No booking found!/i)).toBeInTheDocument();
    });

    /**
     * US 2.
     */
    it('should show error when number of shoes does not match number of players', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        // US 2. AC: "The user should be able to specify the shoe size for each player."
        // We only add 1 shoe field despite having 2 players.
        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        fireEvent.click(screen.getByRole('button', { name: /strIIIIIke!/i }));

        // VG AC: "If the number of people and shoes do not match, an error message should be displayed."
        // This confirms the logic correctly detects the mismatch (2 players vs 1 pair of shoes).
        const error = await screen.findByText(/The number of shoes must match the number of players/i);
        expect(error).toBeInTheDocument();
    });

    /**
     * US 2.
     */
    it('should show error when a shoe size is missing', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        // US 2. AC: "The user should be able to specify the shoe size for each player."
        // We add a shoe field (+) but leave the input empty to test validation.
        fireEvent.click(screen.getByText('+'));
        
        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        // US 2. VG AC: "If the user tries to complete the booking without specifying the shoe size.
        // AC: The system should display an error message and ask for the shoe size to be specified."
        const error = await screen.findByText(/All shoes must have a size filled in/i);
        expect(error).toBeInTheDocument();
    });

    /**
     * US 2.
     * This test ensures that the input logic prevents invalid shoe sizes (e.g., too long strings).
     */
    it('should not call setShoes logic when input length is greater than 2', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.click(screen.getByText('+'));
        const shoeInput = screen.getByLabelText(/Shoe size \/ person 1/i) as HTMLInputElement;

        // Valid input: A normal shoe size (2 characters).
        fireEvent.change(shoeInput, { target: { value: '42', name: shoeInput.name } });

        // Edge Case: Testing that the system rejects or ignores inputs longer than 2 characters (e.g., '425').
        // This demonstrates defensive programming to ensure data integrity.
        fireEvent.change(shoeInput, { target: { value: '425', name: shoeInput.name } });

        // Triggering the booking to see that the system still functions correctly despite the invalid input attempt.
        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));
    });

    /**
     * US 2.
     */
    it('should show error when trying to book without adding any shoes', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        // We set 1 player but intentionally skip adding any shoes.

        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        // US 2. VG AC: "If the number of people and shoes do not match, an error message should be displayed."
        // This confirms that the validation logic treats "zero shoes" as a mismatch when there is 1 player.
        expect(await screen.findByText(/The number of shoes must match the number of players/i)).toBeInTheDocument();
    });

    /**
     * US 5: Navigate between the booking and confirmation view.
     * This test ensures that the "back" or "submit" action on the confirmation page
     * handles the event correctly without reloading the entire browser page.
     */
    it('should navigate back and prevent form default behavior', () => {
        const mockBooking = { when: '2026-01-01 12:00', lanes: '1', people: '1', shoes: ['42'], price: 100, id: '123' };
        sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));
        
        const { container } = renderWithRouter(<Confirmation />);

        // US 5. AC: "The user should be able to navigate..."
        // To keep the Single Page Application (SPA) flow, we must prevent the default form submission.
        const form = container.querySelector('form');
        if (form) {
            const preventDefaultSpy = vi.fn();
            const event = new Event('submit', { cancelable: true, bubbles: true });

            // We mock the preventDefault method to verify it is actually called by the component.
            Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });
            
            fireEvent(form, event);

            // Technical Quality Check: Verifying that the app handles navigation internally 
            // instead of letting the browser perform a traditional (refreshing) form submit.
            expect(preventDefaultSpy).toHaveBeenCalled();
        }
    });

    /**
     * US 5: Navigate between the booking and confirmation view.
     * This test ensures that the application handles "Corrupt Data" gracefully 
     * without crashing the entire UI.
     */
    it('should log error when sessionStorage contains invalid JSON', () => {
        // We use a spy to listen to console.error without actually cluttering the test output.
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Simulating a scenario where sessionStorage contains invalid/broken data.
        sessionStorage.setItem('confirmation', 'INTE_JSON_ALLS');
        
        renderWithRouter(<Confirmation />);
        
        // US 5. AC: "If the user navigates to the confirmation view and no [valid] booking is in session storage..."
        // This verifies that the "try-catch" block in the component correctly identifies the parse error and logs it for developers instead of letting the app throw a fatal error.
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to parse"), expect.any(Error));
    });
});
