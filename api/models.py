from peewee import *

from database import db

class Actor(Model):
    name = CharField()
    surname = CharField()

    class Meta:
        database = db

class Movie(Model):
    title = CharField()
    year = IntegerField()
    director = CharField()
    description = TextField()
    actors = ManyToManyField(model=Actor, backref='movies')

    class Meta:
        database = db


ActorMovie = Movie.actors.get_through_model()

db.connect()
db.create_tables([Movie, Actor, ActorMovie])
db.close()
