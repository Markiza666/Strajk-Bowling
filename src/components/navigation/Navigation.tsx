import './Navigation.scss';
import navicon from '../../assets/navicon.svg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navigation() {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState<boolean>(false);

    return (
        <nav className={`navigation ${showMenu ? 'show-menu' : ''}`}>
            <img 
                src={navicon} 
                className='navigation__icon'
                alt="Menu icon"
                onClick={() => setShowMenu(!showMenu)} 
            />
            <a 
                href="#" 
                className={`navigation__link ${showMenu ? '' : 'hide'}`} 
                onClick={(e) => { e.preventDefault(); navigate('/'); }}
            >
                Booking
            </a>
            <a 
                href="#" 
                className={`navigation__link ${showMenu ? '' : 'hide'}`} 
                onClick={(e) => { e.preventDefault(); navigate('/confirmation'); }}
            >
                Confirmation
            </a>
        </nav>
    );
}

export default Navigation;
