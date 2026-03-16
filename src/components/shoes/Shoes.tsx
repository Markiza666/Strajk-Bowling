import "./Shoes.scss";
import { nanoid } from "nanoid";
import Input from "../input/Input";

interface Shoe {
    id: string;
    size: string;
}

interface ShoesProps {
    updateSize: (event: React.ChangeEvent<HTMLInputElement>) => void;
    addShoe: (id: string) => void;
    removeShoe: (id: string) => void;
    shoes: Shoe[];
}

function Shoes({ updateSize, addShoe, removeShoe, shoes }: ShoesProps) {
    return (
        <section className="shoes">
            <header>
                <h2 className="shoes__heading">Shoes</h2>
            </header>
            {shoes.map((shoe, index) => (
                <article className="shoes__form" key={shoe.id}>
                    <Input
                        label={`Shoe size / person ${index + 1}`}
                        type="text"
                        customClass="shoes__input"
                        name={shoe.id}
                        handleChange={updateSize}
                        maxLength={2}
                    />
                    <button
                        className="shoes__button shoes__button--small"
                        type="button"
                        onClick={() => removeShoe(shoe.id)}
                    >
                        -
                    </button>
                </article>
            ))}
            <button
                className="shoes__button"
                type="button"
                onClick={() => addShoe(nanoid())}
            >
                +
            </button>
        </section>
    );
}

export default Shoes;
