import {useState} from "react";

export default function MovieForm(props) {
    const [title, setTitle] = useState(props.movie.title);
    const [year, setYear] = useState(props.movie.year);
    const [director, setDirector] = useState(props.movie.director);
    const [description, setDescription] = useState(props.movie.description);

    function addMovie(event) {
        event.preventDefault();
        if (title.length < 5) {
            return alert('Tytuł jest za krótki');
        }
        props.onMovieSubmit({title, year, director, description});
        setTitle('');
        setYear('');
        setDirector('');
        setDescription('');
    }

    return <form onSubmit={addMovie}>
        <h2>{props.title}</h2>
        <div>
            <label>Title</label>
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)}/>
        </div>
        <div>
            <label>Year</label>
            <input type="text" value={year} onChange={(event) => setYear(event.target.value)}/>
        </div>
        <div>
            <label>Director</label>
            <input type="text" value={director} onChange={(event) => setDirector(event.target.value)}/>
        </div>
        <div>
            <label>Description</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)}/>
        </div>
        <button>{props.buttonLabel || 'Submit'}</button>
    </form>;
}
