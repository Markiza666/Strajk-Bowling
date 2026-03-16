import './Top.scss';
import logo from "../../assets/strajk-logo.svg";

interface TopProps {
    title: string;
}

function Top({ title }: TopProps) {
    return (
        <header className='top'>
            <img src={logo} className="top__logo" alt="Strajk logo" />
            <h1 className="top__title">{title}</h1>
        </header>
    );
}

export default Top;
