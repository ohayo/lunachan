import '../assets/styles/post.css'
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function Post(props) {
    let location = useLocation();
    let searchParams = new URLSearchParams(location.search);

    const thread = searchParams.get('thread');

    let threadReply = "";

    if (thread != null) {
        threadReply = `&thread=${thread}`;
    }

    if (props.in_thread != 0) {
        threadReply = `&thread=${props.in_thread}`;
    }

    return (
        <div className="post">
            <div className="post-header">
                {props.pinned ? <h3 style={{color: 'var(--pinned-text-color)'}}>- PINNED -</h3> : <></>}
                {props.subject ? <h3 style={{color: 'var(--thread-text-color)'}}>- THREAD -</h3> : <></>}
                {props.subject ? <h3 className="detail">{props.subject.length > 20 ? props.subject.substring(0, 20) + '...' : props.subject}</h3> : <></>}
                <h3 style={{color: 'var(--author-text-color)'}}>{props.author.length > 20 ? props.author.substring(0, 20) + '...' : props.author}</h3>
                <h3 className="detail">{props.date}</h3>
                <h3 className="detail">#{props.number}</h3>
                {props.subject && !props.pinned && (thread == null) ? <a href={`/board?name=${props.board}&thread=${props.number}&where=${props.number}`} className="post-link" style={{marginRight: '5px'}}>[View Thread]</a> : <></>}
                {!props.pinned ? <a href={`/board?name=${props.board}&mode=reply&where=${props.number}${props.subject ? `&thread=${props.number}` : (threadReply)}`} className="post-link">[Reply]</a> : <></>}
            </div>
            <hr className="post-header-separator"></hr>
            <div className="post-body" style={props.selected ? {backgroundColor: "var(--tsuki-super-light)"} : {}}>
                {props.file ? <div className="post-file">
                    {props.file.type == "img" ? (<a href={props.file.link}><img src={props.file.link}></img></a>) : <video controls><source src={props.file.link} type="video/mp4"></source></video>}
                    <span className="detail">File: <a href={props.file.link} className="post-link">{props.file.name}</a> ({props.file.size}, {props.file.width}x{props.file.height}, {props.file.originalname})</span>
                </div> : <></>}
                <div className="post-text">
                    <p style={{ whiteSpace: "pre-line" }}>
                    {   
                        props.isReply && !props.replyToThread ? (
                            <Link to={`/board?name=${props.board}&where=${props.replyTo}${threadReply}`} className="post-link">{`>>${props.replyTo}\n${(!props.comment ? "No comment" : props.comment)}`}</Link>
                        ) : !props.comment ? ("No comment") : (props.comment)
                    }
                    </p>
                </div>
            </div>
        </div>
    )
}