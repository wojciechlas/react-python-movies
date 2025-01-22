import {useState} from "react";

export default function MovieForm(props) {
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');

    function addMovie(event) {
        event.preventDefault();
        if (title.length < 5) {
            return alert('Tytuł jest za krótki');
        }
        props.onMovieSubmit({title, year});
        setTitle('');
        setYear('');
    }

    return <form onSubmit={addMovie}>
        <h2>Add movie</h2>
        <div>
            <label>Tytuł</label>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)}/>
        </div>
        <div>
            <label>Rok nagrania</label>
            <input type="text" value={year} onChange={(event) => setYear(event.target.value)}/>
        </div>
        <button>{props.buttonLabel || 'Submit'}</button>
    </form>;
}
