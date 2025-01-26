import './App.css';
import {useState, useEffect} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import ActorsList from "./ActorsList";
import ActorForm from "./ActorForm";

function App() {
    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);
    const [editingMovie, setEditingMovie] = useState(false);

    useEffect(() => {
        fetchMovies();
    }, []);

    async function fetchMovies() {
        const response = await fetch('/movies');
        if (response.ok) {
            const movies = await response.json();
            setMovies(movies);
        }
    }

    async function handleAddMovie(movie) {
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            setMovies([...movies, movie]);
            setAddingMovie(false);
        }
    }

    async function handleDeleteMovie(movie) {
        const response = await fetch(`/movies/${movie.id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            setMovies(movies.filter(m => m !== movie));
        }
    }

    async function handleOpenEditMovie(movie) {
        setMovie(movie)
        setEditingMovie(true);
    }

    async function handleEditMovie(edited_movie) {
        const response = await fetch(`/movies/${movie.id}`, {
            method: 'PUT',
            body: JSON.stringify(edited_movie),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            fetchMovies();
            setEditingMovie(false);
        }
        
    }

    const [actors, setActors] = useState([]);
    const [addingActor, setAddingActor] = useState(false)

    useEffect(() => {
        const fetchActors= async () => {
            const response = await fetch('/actors');
            if (response.ok) {
                const actors = await response.json();
                setActors(actors);
            }
        };
        fetchActors();
    }, []);

    async function handleAddActor(actor) {
        const response = await fetch('/actors', {
            method: 'POST',
            body: JSON.stringify(actor),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            setActors([...actors, actor]);
            setAddingActor(false);
        }
    }
    
    async function handleDeleteActor(actor) {
        const response = await fetch(`/actors/${actor.id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            setActors(actors.filter(m => m !== actor));
        }
    }

    return (
        <div class="container">
            <div class="row">
                <h1>My favourite movies to watch</h1>
            </div>
            <div class="row">
                <div class="column column-75">
                    {movies.length === 0
                        ? <p>No movies yet. Maybe add something?</p>
                        : <MoviesList movies={movies}
                                        onDeleteMovie={handleDeleteMovie}
                                        onEditMovie={handleOpenEditMovie}
                        />}
                    {addingMovie
                        ? <MovieForm onMovieSubmit={handleAddMovie}
                                        title="Add movie"
                                        buttonLabel="Add a movie"
                                        movie={{}}
                        />
                        : <button onClick={() => setAddingMovie(true)}>Add a movie</button>}
                    {editingMovie
                        ? <MovieForm onMovieSubmit={handleEditMovie}
                                        title="Edit movie"
                                        buttonLabel="Save changes"
                                        movie={movie}
                        />
                        : <div></div>}

                </div>
                <div class="column">
                    {actors.length === 0
                        ? <p>No actors yet. Maybe add someone?</p>
                        : <ActorsList actors={actors}
                                        onDeleteActor={handleDeleteActor}
                        />}
                    {addingActor
                        ? <ActorForm onActorSubmit={handleAddActor}
                                        buttonLabel="Add an actor"
                        />
                        : <button onClick={() => setAddingActor(true)}>Add an actor</button>}
                </div>
            </div>

        </div>
    );
}

export default App;
