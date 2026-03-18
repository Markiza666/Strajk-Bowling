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

    it('should complete booking and interact with confirmation page', async () => {
        renderFullFlow();

        // Simulate user entering booking details
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-24' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '14:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        // Add a pair of shoes and select size
        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        // Click the submit button (STRIIIIKE!)
        fireEvent.click(screen.getByRole('button', { name: /strIIIIIke/i }));

        // Wait for navigation to the confirmation page and check for success message
        await waitFor(() => {
            expect(screen.getByText(/See you soon!/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // Test navigation back to start from the confirmation page
        const finalBtn = screen.getByRole('button', { name: /sweet/i });
        fireEvent.click(finalBtn);

        await waitFor(() => {
            const heading = screen.getByRole('heading', { name: /Booking/i, level: 1 });
            expect(heading).toBeInTheDocument();
        });
    });

    it('should show error message when fields are missing and allow removing shoes', async () => {
        renderFullFlow();

        fireEvent.click(screen.getByText('+'));
        expect(screen.getByLabelText(/Shoe size \/ person 1/i)).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('-'));
        expect(screen.queryByLabelText(/Shoe size \/ person 1/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        await waitFor(() => {
            expect(screen.getByText(/All fields must be filled in/i)).toBeInTheDocument();
        });
    });

    it('should show error when booking a date in the past', async () => {
        renderFullFlow();
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '1994-01-01' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        await waitFor(() => {
            expect(screen.getByText(/You cannot book a date in the past/i)).toBeInTheDocument();
        });
    });

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
        
        expect(await screen.findByText(/maximum of 4 players per lane/i)).toBeInTheDocument();
    });

    it('should show technical error when API call fails', async () => {
        // Mocking a server error (500) to test how the UI handles API failures
        server.use(
            http.post('https://731xy9c2ak.execute-api.eu-north-1.amazonaws.com/booking', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        renderWithRouter(<Booking />);

        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });
        
        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        expect(await screen.findByText(/A technical error occurred/i)).toBeInTheDocument();
    });

    it('should show "No booking found" when navigating directly to confirmation', () => {
        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Routes>
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/No booking found!/i)).toBeInTheDocument();
    });

    it('should show error when number of shoes does not match number of players', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '2' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        fireEvent.click(screen.getByText('+'));
        fireEvent.change(screen.getByLabelText(/Shoe size \/ person 1/i), { target: { value: '42' } });

        fireEvent.click(screen.getByRole('button', { name: /strIIIIIke!/i }));

        const error = await screen.findByText(/The number of shoes must match the number of players/i);
        expect(error).toBeInTheDocument();
    });

    it('should show error when a shoe size is missing', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        fireEvent.click(screen.getByText('+'));
        
        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        const error = await screen.findByText(/All shoes must have a size filled in/i);
        expect(error).toBeInTheDocument();
    });

    it('should not call setShoes logic when input length is greater than 2', async () => {
    renderWithRouter(<Booking />);
    
    fireEvent.click(screen.getByText('+'));
    const shoeInput = screen.getByLabelText(/Shoe size \/ person 1/i) as HTMLInputElement;

    fireEvent.change(shoeInput, { target: { value: '42', name: shoeInput.name } });
    
    fireEvent.change(shoeInput, { target: { value: '425', name: shoeInput.name } });

    fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));
});

    it('should show error when trying to book without adding any shoes', async () => {
        renderWithRouter(<Booking />);
        
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2026-12-12' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '18:00' } });
        fireEvent.change(screen.getByLabelText(/Number of awesome bowlers/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Number of lanes/i), { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: /str.*ike/i }));

        expect(await screen.findByText(/The number of shoes must match the number of players/i)).toBeInTheDocument();
    });

    it('should navigate back and prevent form default behavior', () => {
        const mockBooking = { when: '2026-01-01 12:00', lanes: '1', people: '1', shoes: ['42'], price: 100, id: '123' };
        sessionStorage.setItem('confirmation', JSON.stringify(mockBooking));
        
        const { container } = renderWithRouter(<Confirmation />);

        const form = container.querySelector('form');
        if (form) {
            const preventDefaultSpy = vi.fn();
            const event = new Event('submit', { cancelable: true, bubbles: true });
            Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy });
            
            fireEvent(form, event);
            expect(preventDefaultSpy).toHaveBeenCalled();
        }
    });

    it('should log error when sessionStorage contains invalid JSON', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        sessionStorage.setItem('confirmation', 'INTE_JSON_ALLS');
        
        renderWithRouter(<Confirmation />);
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to parse"), expect.any(Error));
    });
});
