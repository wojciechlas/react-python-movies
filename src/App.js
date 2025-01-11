import './App.css';
import {useState} from "react";
import "milligram";
import MovieForm from "./MovieForm";

function App() {
    const [movies, setMovies] = useState([]);

    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
            <h2>Titles</h2>
            <ul>
                {movies.map(movie => <li key={movie.title}>{movie.title} ({movie.year})</li>)}
            </ul>
            <MovieForm onMovieSubmit={(movie) => setMovies([...movies, movie])} buttonLabel="Add a movie"/>
        </div>
    );
}

export default App;
