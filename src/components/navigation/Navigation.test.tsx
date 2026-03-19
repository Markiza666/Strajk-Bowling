import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderWithRouter = () => {
    return render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Navigation />
        </MemoryRouter>
    );
};

describe('Navigation Component', () => {
    /**
     * US 5: As a user, I want to be able to navigate between the booking and confirmation views.
     * Criteria: The user should be able to navigate from the booking view to the confirmation view when the booking is done.
     */
    it('should toggle menu and navigate when links are clicked', async () => {
        renderWithRouter();
        
        const navicon = screen.getByRole('img', { name: /menu icon/i }); 
        const navMenu = screen.getByRole('navigation');

        // Testing the interaction required to access navigation links.
        // Opening the menu to make navigation possible.
        fireEvent.click(navicon);
        expect(navMenu).toHaveClass('show-menu'); 
        
        // AC: "The user should be able to navigate from the booking view to the confirmation view..."
        // Verifying that the link to the booking page works and calls the correct route.
        const bookingLink = screen.getByText(/Booking/i);
        fireEvent.click(bookingLink);
        expect(mockNavigate).toHaveBeenCalledWith('/');

        // AC: If the user navigates to the confirmation view and there is a booking saved in session storage, this should be displayed.
        // Verifying that the user can navigate to the confirmation view.
        const confirmationLink = screen.getByText(/Confirmation/i);
        fireEvent.click(confirmationLink);
        expect(mockNavigate).toHaveBeenCalledWith('/confirmation');

        // Testing the UI robustness: The menu should be able to close (toggle) as well.
        fireEvent.click(navicon);
        expect(navMenu).not.toHaveClass('show-menu');
    });
});
