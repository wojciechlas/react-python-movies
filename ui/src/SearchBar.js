import { useState } from "react";

export default function SearchBar(props) {
    const [query, setQuery] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const params = new URLSearchParams({ query });
        // if (selectedActors.length > 0) {
        //   params.append("actors", selectedActors.join(","));
        // }
        const response = await fetch(`/movies/search/vector?${params.toString()}`);
        if (response.ok) {
          const results = await response.json();
          // Przekaż wyniki wyszukiwania do komponentu App
          props.onSearchResults(results);
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