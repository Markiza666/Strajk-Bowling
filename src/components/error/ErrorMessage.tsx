import "./ErrorMessage.scss";

interface ErrorMessageProps {
    message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <article className="error-message">
            <p className="error-message__text">{message}</p>
        </article>
    );
}

export default ErrorMessage;
