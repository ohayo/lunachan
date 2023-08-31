import '../assets/styles/recent.css'
import { Link } from "react-router-dom";

export default function Recent(props) {
    return (
        <div id="recent">
            <div id="header">
                <h1>Recent</h1>
            </div>
            <div id="recent-posts">
                {props.posts.map((recent, index) => {
                    return (
                        <p key={index}>
                            <span>{recent.board}: </span>
                            <Link to={`/board?name=${recent.board}&where=${recent.number}${(recent.in_thread != 0 ? `&thread=${recent.in_thread}` : "")}`}>{recent.comment.length > 30 ? recent.comment.substring(0, 30) + '...' : recent.comment}</Link>
                        </p>
                    )
                })}
            </div>
        </div>
    )
}