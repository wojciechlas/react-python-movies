from contextvars import ContextVar
import peewee
from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.http.models import Distance, VectorParams
import os

DATABASE_NAME = "movies.db"
db_state_default = {"closed": None, "conn": None, "ctx": None, "transactions": None}
db_state = ContextVar("db_state", default=db_state_default.copy())

# Pobierz URL i API Key z zmiennych środowiskowych
QDRANT_URL = os.environ.get("QDRANT_URL")
QDRANT_API_KEY = os.environ.get("QDRANT_API_KEY")

# Inicjalizacja klienta Qdrant
qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

# Sprawdź, czy kolekcja "movies" istnieje
try:
    qdrant_client.get_collection(collection_name="movies")
except UnexpectedResponse as e:
    if e.status_code == 404:
        # Utwórz kolekcję "movies"
        qdrant_client.create_collection(
            collection_name="movies",
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
    else:
        raise e

class PeeweeConnectionState(peewee._ConnectionState):
    def __init__(self, **kwargs):
        super().__setattr__("_state", db_state)
        super().__init__(**kwargs)

    def __setattr__(self, name, value):
        self._state.get()[name] = value

    def __getattr__(self, name):
        return self._state.get()[name]

db = peewee.SqliteDatabase(DATABASE_NAME, check_same_thread=False)

db._state = PeeweeConnectionState()