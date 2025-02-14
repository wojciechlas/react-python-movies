import { useState } from "react";
import { toast } from 'react-toastify';

export default function SearchBar(props) {
    const [query, setQuery] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const params = new URLSearchParams({ query });
        // if (selectedActors.length > 0) {
        //   params.append("actors", selectedActors.join(","));
        // }
        const response = await toast.promise(
            fetch(`/movies/search/vector?${params.toString()}`),
            {
                pending: 'Searching...',
                success: 'Search completed',
                error: "Can't execute search 🤯"
            }
        );
        if (response.ok) {
          const results = await response.json();
          // Przekaż wyniki wyszukiwania do komponentu App
          props.onSearchResults(results);
        } else {
            const error = await response.json();
            toast.error(`Error while searching: ${error.detail}`);
        }
    };
    
    const handleClearSearch = () => {
        setQuery("");
        props.onSearchResults([]); // Wyczyść wyniki wyszukiwania w komponencie App
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: "flex" }}>
                <input
                type="text"
                placeholder="Wyszukaj film"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ flexGrow: 5 }} 
                />
                {query?<button type="button" onClick={handleClearSearch} style={{ marginLeft: "5px" }}>
                X
                </button>:<div></div>}
                <button type="submit" style={{ marginLeft: "5px" }}>Search</button>
            </div>
        
        </form>
    );
}