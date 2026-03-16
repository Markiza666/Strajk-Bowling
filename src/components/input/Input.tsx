import "./Input.scss";

interface InputProps {
    label: string;
    type: string;
    customClass?: string;
    name: string;
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    defaultValue?: string | number;
    disabled?: boolean | string;
    maxLength?: number;
}

function Input({
    label,
    type,
    customClass,
    name,
    handleChange,
    defaultValue,
    disabled,
    maxLength,
}: InputProps) {
    const inputId = `input-${name}`; 

    return (
        <section className="input">
            <label className="input__label" htmlFor={inputId}>
                {label}
            </label>
            <input
                id={inputId}
                type={type}
                className={`input__field ${customClass ? customClass : ""}`}
                name={name}
                onChange={handleChange}
                defaultValue={defaultValue ? defaultValue : ""}
                maxLength={maxLength}
                disabled={!!disabled}
            />
        </section>
    );
}

export default Input;
