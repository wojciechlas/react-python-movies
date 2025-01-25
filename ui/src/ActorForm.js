import {useState} from "react";

export default function ActorForm(props) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');

    function addActor(event) {
        event.preventDefault();
        if (name.length < 1) {
            return alert('Imię jest za krótkie');
        }
        if (surname.length < 1) {
            return alert('Nazwisko jest za krótkie');
        }
        props.onActorSubmit({name, surname});
        setName('');
        setSurname('');
    }

    return <form onSubmit={addActor}>
        <h2>Add actor</h2>
        <div>
            <label>Imię</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)}/>
        </div>
        <div>
            <label>Nazwisko</label>
            <input type="text" value={surname} onChange={(event) => setSurname(event.target.value)}/>
        </div>
        <button>{props.buttonLabel || 'Submit'}</button>
    </form>;
}