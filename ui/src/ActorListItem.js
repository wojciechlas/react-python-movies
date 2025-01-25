export default function ActorListItem(props) {
    return (
        <div>
            <span>{props.actor.name}</span>
            {' '}
            <strong>{props.actor.surname}</strong>
            {' '}
            <a onClick={props.onDelete}>Delete</a>
        </div>
    );
}
