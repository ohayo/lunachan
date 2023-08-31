import Header from '../components/header'
import Banner from '../components/banner'
import NewPost from '../components/newpost'
import Post from '../components/post'
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from "react";

export default function Board() {
    let location = useLocation();
    let searchParams = new URLSearchParams(location.search);
    let boardname = "anime"; //fallback
    let highlight = "";
    let mode = "post";
    let thread = null;

    const [boards, setBoards] = useState([]);
    const [posts, setPosts] = useState([]);
    const [banner, setBanner] = useState({});

    if (location.search.includes("where=")) {
        highlight = searchParams.get('where');
    }

    if (location.search.includes("mode=reply")) {
        mode = "reply";
    }

    if (location.search.includes("name=")) {
        boardname = searchParams.get('name');
    }

    if (location.search.includes("thread=")) {
        thread = searchParams.get('thread');
    }

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/boards`);
            const data = await res.json();

            setBoards(data);
        }

        async function fetchBanner() {
            const res = await fetch(`/api/boards/${boardname}`);
            const data = await res.json();

            setBanner(data);
        }

        async function fetchPosts() {
            const res = await fetch(`/api/boards/${boardname}/posts`);
            const data = await res.json();

            let uh = data;

            if (thread != null && thread != 0) {
                const initialpost = uh.filter(x => x.in_thread == 0 && x.number == thread)[0];

                let ret = [];
            
                ret.push(initialpost);

                uh = uh.filter(x => x.in_thread == thread);
            
                ret.push(...uh);
            
                setPosts(ret);
            } else {
                uh = uh.filter(x => x.subject != "");

                setPosts(uh);
            }
        }

        if (boards.length === 0) {
            fetchData();
        }

        fetchPosts();
        fetchBanner();
    }, [boardname]);

    return (<>
        <Header boards={boards}/>
        <div className="content">
            <Banner image={banner.image} name={banner.name} description={banner.description} />
            <NewPost mode={mode} board={boardname} />
            <div id="posts">
                {posts.map((post, index) => {
                    const isMultipleOfFive = (index + 1) % (posts.filter(x => x.pinned).length > 0 ? 6 : 5) === 0;
                    const isLastPost = index === posts.length - 1;
                    const shouldRenderHr = isMultipleOfFive && !isLastPost;
                    
                    let replyingToThread = true;

                    if (post.reply != null) {
                        let specificPost = posts.filter(x => x.number == post.reply.to);

                        if (specificPost.length > 0 && specificPost[0].in_thread != 0) {
                            replyingToThread = false;
                        }
                    }

                    return (
                        <React.Fragment key={index}>
                            <Post board={post.board} pinned={post.pinned} subject={post.subject} author={post.author} date={post.date} number={post.number} comment={post.comment} file={post.file} selected={highlight == post.number} isReply={post.reply != null} replyTo={post.reply ? post.reply.to : 0} replyToThread={replyingToThread} in_thread={post.in_thread} />
                            {shouldRenderHr && <hr />}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    </>)
}