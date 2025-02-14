import './App.css';
import {useState, useEffect} from "react";
import "milligram";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import ActorsList from "./ActorsList";
import ActorForm from "./ActorForm";
import SearchBar from './SearchBar';

function App() {
    const [movies, setMovies] = useState([]);
    const [movie, setMovie] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);
    const [editingMovie, setEditingMovie] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchMovies();
    }, []);

    async function fetchMovies() {
        const response = await toast.promise(
            fetch('/movies'),
            {
                pending: 'Loading movies...',
                success: 'Movies loaded',
                error: "Can't load movies 🤯"
            }
        );
            if (response.ok) {
                const movies = await response.json();
                setMovies(movies);
            } else {
                const error = await response.json();
                toast.error(`Error while loading movies: ${error.detail}`);
                console.log(error)
            }
    }

    async function fetchMovieActors(movieId) {
        const response = await toast.promise(
            fetch(`/movies/${movieId}/actors`),
            {
                pending: 'Loading actors...',
                success: 'Actors loaded',
                error: "Can't load actors 🤯"
            }
        );
        if (response.ok) {
          const actors = await response.json();
          return actors;
        } else {
            const error = await response.json();
            toast.error(`Error while loading actors: ${error.detail}`);
            console.log(error)
        }
        return;
      }

    async function handleAddMovie(movie) {
        setAddingMovie(false);
        const response = await toast.promise(
            fetch('/movies', {
                method: 'POST',
                body: JSON.stringify(movie),
                headers: { 'Content-Type': 'application/json' }
            }),
            {
                pending: 'Adding thr movie...',
                success: 'The movie added',
                error: "Can't add the movie 🤯"
            }
        );        
        if (response.ok) {
            setMovies([...movies, movie]);
        } else {
            const error = await response.json();
            toast.error(`Error while adding the movie: ${error.detail}`);
            console.log(error)
        }
    }

    async function handleDeleteMovie(movie) {
        const confirmDelete = window.confirm(`Are you sure to delete "${movie.title}"?`);
        if (confirmDelete) {
            const response = await toast.promise(
                await fetch(`/movies/${movie.id}`, {
                    method: 'DELETE'
                }),
                {
                    pending: 'Deleting the movie...',
                    success: 'The movie deleted',
                    error: "Can't delete the movie 🤯"
                }
            );
            if (response.ok) {
                setMovies(movies.filter(m => m !== movie));
            } else {
                const error = await response.json();
                toast.error(`Error while deleting the movie: ${error.detail}`);
                console.log(error)
            }
        }
    }

    async function handleOpenEditMovie(movie) {
        const actors = await fetchMovieActors(movie.id);
        setMovie({...movie, actors: actors });
        setEditingMovie(true);
    }

    async function handleEditMovie(edited_movie) {
        setEditingMovie(false);
        const response = await toast.promise(
            fetch(`/movies/${movie.id}`, {
                method: 'PUT',
                body: JSON.stringify(edited_movie),
                headers: { 'Content-Type': 'application/json' }
            }),
            {
                pending: 'Updating the movie...',
                success: 'The movie updated',
                error: "Can't update the movie 🤯"
            }
        );
        if (response.ok) {
            fetchMovies();
        } else {
            const error = await response.json();
            toast.error(`Error while editing movie: ${error.detail}`);
        }
    }

    const [actors, setActors] = useState([]);
    const [addingActor, setAddingActor] = useState(false)

    useEffect(() => {
        const fetchActors= async () => {
            const response = await toast.promise(
                fetch('/actors'),
                {
                    pending: 'Loading actors...',
                    success: 'Actors loaded',
                    error: "Can't load actors 🤯"
                }
            );
            if (response.ok) {
                const actors = await response.json();
                setActors(actors);
            } else {
                const error = await response.json();
                toast.error(`Error while loading actors: ${error.detail}`);
            }
        };
        fetchActors();
    }, []);

    async function handleAddActor(actor) {
        setAddingActor(false);
        const response = await toast.promise(
            fetch('/actors', {
                method: 'POST',
                body: JSON.stringify(actor),
                headers: { 'Content-Type': 'application/json' }
            }),
            {
                pending: 'Adding the actor...',
                success: 'The actor loaded',
                error: "Can't load the actor 🤯"
            }
        );
        if (response.ok) {
            setActors([...actors, actor]);
        } else {
            const error = await response.json();
            toast.error(`Error while adding actor: ${error.detail}`);
        }
    }
    
    async function handleDeleteActor(actor) {
        const confirmDelete = window.confirm(`Are you sure to delete ${actor.name} ${actor.surname}?`);
        if (confirmDelete) {
            const response = await toast.promise(
                fetch(`/actors/${actor.id}`, {
                    method: 'DELETE'
                }),
                {
                    pending: 'Deleting the actor...',
                    success: 'The actor deleted',
                    error: "Can't delete the actor 🤯"
                }
            );
            if (response.ok) {
                setActors(actors.filter(m => m !== actor));
            } else {
                const error = await response.json();
                toast.error(`Error while deleting actor: ${error.detail}`);
            }
        }
    }

    async function handleSearchResults(results) {
        setSearchResults(results);
    }

    return (
        <div class="container">
            <div class="row">
                <h1>My favourite movies to watch</h1>
            </div>
            <div class="row">
                <div class="column column-75">
                    <SearchBar onSearchResults={handleSearchResults} />
                    {movies.length === 0
                        ? <p>No movies yet. Maybe add something?</p>
                        : <MoviesList movies={searchResults.length > 0 ? searchResults: movies}
                                        onDeleteMovie={handleDeleteMovie}
                                        onEditMovie={handleOpenEditMovie}
                        />}
                    {addingMovie
                        ? <MovieForm onMovieSubmit={handleAddMovie}
                                        onCancel={() => setAddingMovie(false)}
                                        title="Add movie"
                                        buttonLabel="Add a movie"
                                        movie={{}}
                        />
                        : <button onClick={() => setAddingMovie(true)}>Add a movie</button>}
                    {editingMovie
                        ? <MovieForm onMovieSubmit={handleEditMovie}
                                        onCancel={() => setEditingMovie(false)}
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
            <ToastContainer 
                position="bottom-right"
                autoClose={3000}
                pauseOnHover
                newestOnTop/>
        </div>
    );
}

export default App;
