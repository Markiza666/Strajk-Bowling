import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Confirmation from './confirmation/Confirmation';

describe('Confirmation View', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('should navigate to start when clicking Go to booking from error view', async () => {
        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Routes>
                    <Route path="/" element={<div data-testid="booking-page">Booking Page</div>} />
                    <Route path="/confirmation" element={<Confirmation />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText(/No booking found!/i)).toBeInTheDocument();

        const backBtn = screen.getByRole('button', { name: /go to booking/i });
        
        fireEvent.click(backBtn);

        await waitFor(() => {
            expect(screen.getByTestId('booking-page')).toBeInTheDocument();
        });
    });

    it('should navigate to start when clicking Sweet lets go from details view', async () => {
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

        const successBtn = await screen.findByRole('button', { name: /sweet/i });
        fireEvent.click(successBtn);

        await waitFor(() => {
            expect(screen.getByTestId('booking-page')).toBeInTheDocument();
        });
    });

    it('should show error message when no booking is found', () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Confirmation />
            </MemoryRouter>
        );

        expect(screen.getByText(/No booking found!/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Go to booking/i })).toBeInTheDocument();
    });

    it('should render details when booking exists', () => {
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

        expect(screen.getByText(/See you soon!/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('123-ABC')).toBeInTheDocument();
    });

    it('should display all booking details correctly when a booking exists', async () => {
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

        expect(screen.getByLabelText(/When/i)).toHaveValue('2026-12-12 18:00');
        expect(screen.getByLabelText(/Who/i)).toHaveValue('4');
        expect(screen.getByLabelText(/Lanes/i)).toHaveValue('1');
        expect(screen.getByLabelText(/Booking number/i)).toHaveValue('STR12345');
        expect(screen.getByText(/440 sek/i)).toBeInTheDocument();
    });

    it('should display all booking details correctly in the input fields', async () => {
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

        expect(screen.getByLabelText(/When/i)).toHaveValue('2026-12-12 18:00');
        expect(screen.getByLabelText(/Who/i)).toHaveValue('4');
        expect(screen.getByLabelText(/Lanes/i)).toHaveValue('1');
        expect(screen.getByLabelText(/Booking number/i)).toHaveValue('STR12345');
        expect(screen.getByText(/440 sek/i)).toBeInTheDocument();
    });

    it('should handle fallback values and verify input branches', async () => {
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

        const dateInput = screen.getByLabelText(/When/i);
        expect(dateInput).toHaveValue('');

        const idInput = screen.getByLabelText(/Booking number/i);
        expect(idInput).toHaveValue('STR123');
    });

    it('should cover all branches on line 92', () => {
        const altBooking = {
            when: '2026-05-05T10:00',
            people: '2',
            lanes: '1',
            price: '400',
            bookingId: 'BOK12345' 
        };
        
        sessionStorage.setItem('confirmation', JSON.stringify(altBooking));

        render(
            <MemoryRouter initialEntries={['/confirmation']}>
                <Confirmation />
            </MemoryRouter>
        );

        const idInput = screen.getByLabelText(/Booking number/i);
        expect(idInput).toHaveValue('BOK12345');
    });

    it('should achieve 100% coverage by satisfying all logic paths', async () => {
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

        const idInput = screen.getByLabelText(/Booking number/i);
        expect(idInput).toHaveValue('BOK12345');

        const whenInput = screen.getByLabelText(/When/i);
        fireEvent.change(whenInput, { target: { value: '2026-05-05 12:00' } });
        
        //
        expect(screen.getByText(/400 sek/i)).toBeInTheDocument();
    });
});
