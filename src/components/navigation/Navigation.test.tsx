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
    
    it('should toggle menu and navigate when links are clicked', async () => {
        renderWithRouter();
        
        const navicon = screen.getByRole('img', { name: /menu icon/i }); 
        const navMenu = screen.getByRole('navigation');

        fireEvent.click(navicon);
        expect(navMenu).toHaveClass('show-menu'); 
        
        const bookingLink = screen.getByText(/Booking/i);
        fireEvent.click(bookingLink);
        expect(mockNavigate).toHaveBeenCalledWith('/');

        const confirmationLink = screen.getByText(/Confirmation/i);
        fireEvent.click(confirmationLink);
        expect(mockNavigate).toHaveBeenCalledWith('/confirmation');

        fireEvent.click(navicon);
        expect(navMenu).not.toHaveClass('show-menu');
    });
});
