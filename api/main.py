from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from peewee import DoesNotExist
from sentence_transformers import SentenceTransformer

import schemas
import models
from database import qdrant_client

# Inicjalizacja modelu SentenceTransformer
transformer = SentenceTransformer('all-mpnet-base-v2')

app = FastAPI()
app.mount("/static", StaticFiles(directory="../ui/build/static", check_dir=False), name="static")


@app.get("/")
def serve_react_app():
    return FileResponse("../ui/build/index.html")

# Movies
@app.get("/movies", response_model=List[schemas.Movie])
def get_movies():
    movies = list(models.Movie.select())
    return movies

@app.get("/movies/{movie_id}", response_model=schemas.Movie)
def get_movie(movie_id: int):
    try:
        movie = models.Movie.get_by_id(id)
        # Pobieranie aktorów dla filmu (już jest wstępnie załadowane)
        return movie
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Movie not found")

@app.post("/movies", response_model=schemas.Movie)
def add_movie(movie: schemas.MovieCreate):
    # Tworzenie nowego filmu
    new_movie = models.Movie.create(**movie.dict(exclude={'actors'}))
    # Dodawanie aktorów do filmu
    if movie.actors:
        for actor_id in movie.actors:
            try:
                actor = models.Actor.get_by_id(actor_id)
                new_movie.actors.add(actor)
            except DoesNotExist:
                raise HTTPException(status_code=404, detail=f"Actor with ID {actor_id} not found")
            
    create_movie_vector(new_movie)
    return new_movie

@app.put("/movies/{id}", response_model=schemas.Movie)
async def update_movie(id: int, movie: schemas.MovieCreate):
    try:
        # Aktualizacja filmu
        db_movie = models.Movie.get_by_id(id)
        for key, value in movie.dict(exclude={'actors'}).items():
            setattr(db_movie, key, value)
        db_movie.save()
        # Aktualizacja aktorów dla filmu
        db_movie.actors.clear()
        for actor_id in movie.actors:
            try:
                actor = models.Actor.get_by_id(actor_id)
                db_movie.actors.add(actor)
            except DoesNotExist:
                raise HTTPException(status_code=404, detail=f"Actor with ID {actor_id} not found")
            
        update_movie_vector(db_movie)
        return db_movie
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Movie not found")

@app.delete("/movies/{id}", response_model=None)
async def delete_movie(id: int):
    try:
        movie = models.Movie.get_by_id(id)
        delete_movie_vector(movie)
        movie.delete_instance()
        return None
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Movie not found")

# Actors
@app.get("/actors", response_model=list[schemas.Actor])
async def get_actors():
    return list(models.Actor.select())

@app.get("/actors/{id}", response_model=schemas.Actor)
async def get_actor(id: int):
    try:
        return models.Actor.get_by_id(id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Actor not found")

@app.post("/actors", response_model=schemas.Actor)
async def create_actor(actor: schemas.ActorCreate):
    new_actor = models.Actor.create(**actor.dict())
    return new_actor

@app.put("/actors/{id}", response_model=schemas.Actor)
async def update_actor(id: int, actor: schemas.ActorCreate):
    try:
        db_actor = models.Actor.get_by_id(id)
        for key, value in actor.dict().items():
            setattr(db_actor, key, value)
        db_actor.save()
        return db_actor
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Actor not found")

@app.delete("/actors/{id}", response_model=None)
async def delete_actor(id: int):
    try:
        actor = models.Actor.get_by_id(id)
        actor.delete_instance()
        return None
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Actor not found")

# Dodatkowe endpointy
@app.get("/movies/{id}/actors", response_model=list[schemas.Actor])
async def get_movie_actors(id: int):
    try:
        movie = models.Movie.get_by_id(id)
        # Pobieranie aktorów dla filmu (już jest wstępnie załadowane)
        return list(movie.actors)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Movie not found")
    
# Obsługa bazy Qdrant
@app.get("/movies/search/vector", response_model=List[schemas.Movie])
async def search_movies_vector(query: str):
    # Wygeneruj wektor dla zapytania
    vector = transformer.encode(query).tolist()

    # Wyszukaj podobne filmy w Qdrant
    search_result = qdrant_client.search(
        collection_name="movies",
        query_vector=vector,
        limit=3,
    )

    # Zwróć listę filmów
    movies = []
    for result in search_result:
        movie = models.Movie.get_by_id(result.id)
        movies.append(movie)
    return movies


def create_movie_vector(movie: schemas.Movie):
    # Połącz wszystkie informacje o filmie w jeden string
    movie_info = f"{movie.title} {movie.year} {movie.director} {movie.description}"

    # Wygeneruj wektor dla filmu
    vector = transformer.encode(movie_info).tolist()

    movie_dict = {
        "title": movie.title,
        "year": movie.year,
        "director": movie.director,
        "description": movie.description,
    }

    # Zapisz wektor w Qdrant
    qdrant_client.upsert(
        collection_name="movies",
        points=[
            {
                "id": movie.id,
                "vector": vector,
                "payload": movie_dict,
            }
        ],
    )

def update_movie_vector(movie: schemas.Movie):
    # Połącz wszystkie informacje o filmie w jeden string
    movie_info = f"{movie.title} {movie.year} {movie.director} {movie.description}"
    
    # Wygeneruj wektor dla filmu
    vector = transformer.encode(movie_info).tolist()

    movie_dict = {
        "title": movie.title,
        "year": movie.year,
        "director": movie.director,
        "description": movie.description,
    }

    qdrant_client.upsert(
        collection_name="movies",
        points=[
            {
                "id": movie.id,
                "vector": vector,
                "payload": movie_dict,
            }
        ],
    )

def delete_movie_vector(movie: schemas.Movie):
    qdrant_client.delete(
        collection_name="movies",
        points_selector=[movie.id]
    )