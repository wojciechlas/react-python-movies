from typing import Any, List, Union

from pydantic import BaseModel

class MovieBase(BaseModel):
    title: str
    year: int
    director: str
    description: str = None

class MovieCreate(MovieBase):
    actors: list[int] = None # Lista ID aktorów

class Movie(MovieBase):
    id: int

    class Config:
        orm_mode = True

class ActorBase(BaseModel):
    name: str
    surname: str

class ActorCreate(ActorBase):
    pass

class Actor(ActorBase):
    id: int

    class Config:
        orm_mode = True


