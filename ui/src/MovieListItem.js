export default function MovieListItem(props) {
    return <span>
        <strong>{props.movie.title}</strong>
        {' '}
        <span>({props.movie.year})</span>
        {' '}
        <a onClick={props.onDelete}>Delete</a>
    </span>;
}
