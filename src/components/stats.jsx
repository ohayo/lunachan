import '../assets/styles/stats.css'

export default function Stats(props) {
    return (
        <div id="stats">
            <div id="header">
                <h1>Stats</h1>
            </div>
            <div id="stats-detail">
                <p>
                    Total posts: {props.total}
                </p>
                <p>
                    Content: {props.content}
                </p>
                <p>
                    Most Active: {props.active}
                </p>
            </div>
        </div>
    )
}