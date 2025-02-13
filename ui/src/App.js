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
        const response = await fetch('/movies');
        if (response.ok) {
            const movies = await response.json();
            setMovies(movies);
        }
        console.log(movies)
    }

    async function fetchMovieActors(movieId) {
        const response = await fetch(`/movies/${movieId}/actors`);
        if (response.ok) {
          const actors = await response.json();
          return actors;
        }
        return;
      }

    async function handleAddMovie(movie) {
        try {
          const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
          });
      
          if (response.ok) {
            setMovies([...movies, movie]);
            setAddingMovie(false);
            toast.success(`Movie "${movie.title}" added`);
          } else {
            const error = await response.json();
            toast.error(`Error while adding movie: ${error.detail}`);
          }
        } catch (error) {
          toast.error(`Error while adding movie: ${error.message}`);
        }
    }

    async function handleDeleteMovie(movie) {
        const confirmDelete = window.confirm(`Are you sure to delete "${movie.title}"?`);
        if (confirmDelete) {
            try {
                const response = await fetch(`/movies/${movie.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setMovies(movies.filter(m => m !== movie));
                    toast.success(`Movie "${movie.title}" deleted`);
                } else {
                    const error = await response.json();
                    toast.error(`Error while deleting movie: ${error.detail}`);
                }
            } catch (error) {
                toast.error(`Error while deleting movie: ${error.message}`);
            }
        }
    }

    async function handleOpenEditMovie(movie) {
        const actors = await fetchMovieActors(movie.id);
        setMovie({...movie, actors: actors });
        setEditingMovie(true);
    }

    async function handleEditMovie(edited_movie) {
        try {
            const response = await fetch(`/movies/${movie.id}`, {
                method: 'PUT',
                body: JSON.stringify(edited_movie),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                fetchMovies();
                setEditingMovie(false);
                toast.success(`Movie "${movie.title}" edited successfully `);
            } else {
                const error = await response.json();
                toast.error(`Error while editing movie: ${error.detail}`);
            }
        } catch (error) {
            toast.error(`Error while editing movie: ${error.message}`);
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
        try {
            const response = await fetch('/actors', {
                method: 'POST',
                body: JSON.stringify(actor),
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (response.ok) {
                setActors([...actors, actor]);
                setAddingActor(false);
                toast.success(`Actor ${actor.name} ${actor.surname} added`);
            } else {
                const error = await response.json();
                toast.error(`Error while adding actor: ${error.detail}`);
            }
        } catch (error) {
            toast.error(`Error while adding actor: ${error.message}`);
        }
    }
    
    async function handleDeleteActor(actor) {
        const confirmDelete = window.confirm(`Are you sure to delete ${actor.name} ${actor.surname}?`);
        if (confirmDelete) {
            try {
                const response = await fetch(`/actors/${actor.id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setActors(actors.filter(m => m !== actor));
                    toast.success(`Actor ${actor.name} ${actor.surname} deleted`);
                } else {
                    const error = await response.json();
                    toast.error(`Error while deleting actor: ${error.detail}`);
                }
            } catch (error) {
                toast.error(`Error while deleting actor: ${error.message}`);
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
            <ToastContainer />
        </div>
    );
}

export default App;
