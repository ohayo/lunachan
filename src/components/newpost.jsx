import { Link } from 'react-router-dom'
import '../assets/styles/newpost.css'
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function NewPost(props) {
    let location = useLocation();
    let searchParams = new URLSearchParams(location.search);

    const boardName = searchParams.get('name');
    const where = searchParams.get('where');
    const mode = searchParams.get('mode');
    let thread = searchParams.get('thread');
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [comment, setComment] = useState("");
    const [fileData, setFileData] = useState(null);
    const [captchaValue, setCaptchaValue] = useState(null);
    const captchaRef = useRef(null);

    const onLoad = () => {
        captchaRef.current.execute();
    };

    function post() {
        if (where == null && subject == "" && thread == null) {
            alert("You haven't selected a post to reply to, please enter a subject to create a new thread or pick a post to reply to.")
            return;
        }

        if (captchaValue == null) {
            alert("You haven't solved the captcha!")
            return;
        }

        let formData = new FormData();

        formData.append('image', fileData);
        formData.append('name', name);
        formData.append('subject', subject);
        formData.append('comment', comment);
        formData.append('captcha', captchaValue);

        if (thread == null) {
            formData.append('in_thread', 0);
        } else if (subject == "") {
            formData.append('in_thread', thread);
        } else {
            formData.append('in_thread', 0);
            thread = null;
        }

        if (fileData == null && comment == "") {
            alert("To make an empty post, you need to provide an image.");
            return;
        }

        if (where != null && mode != null && mode == 'reply') {
            formData.append('reply_to', where);
        }

        fetch(`/api/boards/${props.board}/posts`, {
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                window.location.href = (`/board?name=${boardName}&where=${data.number}${(thread != null ? `&thread=${thread}` : "")}`);
            }
        }).catch(error => {
            console.log(error);
        });
    }

    function handleNameInput(event) {
        setName(event.target.value);
    }

    function handleSubjectInput(event) {
        setSubject(event.target.value);
    }

    function handleCommentInput(event) {
        setComment(event.target.value);
    }

    function handleFileInput(event) {
        const file = event.target.files[0];

        setFileData(file);
    }

    return (
        <div className="new-post">
            {props.mode == "reply" ? <h1 style={{color: "white", fontSize: "16px", backgroundColor: "var(--tsuki-super-light)", padding: "5px"}}>You are replying to a post.</h1> : <></>}
            <div className="input">
                <h1>Name: </h1>
                <input id="name" onChange={handleNameInput}></input>
            </div>
            <div className="input">
                <h1 style={props.mode == "reply" ? {color: "grey"} : {}}>Subject: </h1>
                <input id="subject"  style={props.mode == "reply" ? {backgroundColor: "grey"} : {}} disabled={props.mode == "reply"} onChange={handleSubjectInput}></input>
                <button id="post-button" onClick={post}>{props.mode == "reply" ? "New Reply" : "Post"}</button>
            </div>
            <div className="input">
                <h1>Comment: </h1>
                <textarea id="comment" onChange={handleCommentInput}></textarea>
            </div>
            <div className="input">
                <h1>File: </h1>
                <input id="file" type="file" onChange={handleFileInput}></input>
            </div>
            <div className='input'>
                <h1>Captcha: </h1>
                <HCaptcha sitekey="d1196815-41a6-4985-aee5-6d77dbe9e15d" onLoad={onLoad} onVerify={setCaptchaValue} ref={captchaRef}/>
            </div>
        </div>
    )
}