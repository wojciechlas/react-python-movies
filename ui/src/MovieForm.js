import {useState, useEffect} from "react";
import Select from 'react-select'

export default function MovieForm(props) {
    const [title, setTitle] = useState(props.movie.title || '');
    const [year, setYear] = useState(props.movie.year || '');
    const [director, setDirector] = useState(props.movie.director || '');
    const [description, setDescription] = useState(props.movie.description || '');
    const [selectedActors, setSelectedActors] = useState();
    const [actors, setActors] = useState();

    useEffect(() => {
        const fetchActors = async () => {
            const response = await fetch('/actors');
            if (response.ok) {
                const actors = await response.json();
                setActors(actors);
            }
        };
        fetchActors();

        // Ustawianie pól formularza na podstawie props.movie
        if (props.movie) {
            setTitle(props.movie.title || '');
            setYear(props.movie.year || '');
            setDirector(props.movie.director || '');
            setDescription(props.movie.description || '');

            // Ustawianie wybranych aktorów, jeśli są dostępne
            if (props.movie.actors) {
                setSelectedActors(props.movie.actors.map(actor => actor.id));
            } else {
                setSelectedActors(); // Resetuj selectedActors, jeśli nie ma aktorów
            }
        }
    }, [props.movie]);

    function addMovie(event) {
        event.preventDefault();
        if (title.length < 4) {
            return alert('Tytuł jest za krótki');
        }
        props.onMovieSubmit({title, year, director, description, actors: selectedActors});
        setTitle('');
        setYear('');
        setDirector('');
        setDescription('');
        setSelectedActors();
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
        <div>
            <label>Actors:</label>
            <Select
                isMulti
                name="actors"
                options={actors && actors.map(actor => ({ // Sprawdzenie czy actors jest zdefiniowane
                    value: actor.id,
                    label: `${actor.name} ${actor.surname}`
                }))}
                value={selectedActors && actors && selectedActors.map(actorId => ({ // Sprawdzenie czy actors i selectedActors są zdefiniowane
                    value: actorId,
                    label: actors.find(actor => actor.id === actorId)?.name + ' ' + actors.find(actor => actor.id === actorId)?.surname
                }))}
                onChange={(selectedOptions) => {
                    setSelectedActors(selectedOptions.map(option => option.value));
                }}
            />
        </div>
        <button>{props.buttonLabel || 'Submit'}</button>
        <button type="button" onClick={props.onCancel}>Cancel</button>
    </form>;
}
