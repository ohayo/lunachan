import Header from '../components/header'
import Recent from '../components/recent'
import Stats from '../components/stats'
import '../assets/styles/home.css'
import React, { useEffect, useState } from "react";

export default function Home() {
    const [boards, setBoards] = useState([]);
    const [stats, setStats] = useState({});
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(`/api/boards`);
            const data = await res.json();

            setBoards(data);
        }

        async function fetchStats() {
            const res = await fetch(`/api/boards/stats`);
            const data = await res.json();

            setStats(data);
        }

        async function fetchRecent() {
            const res = await fetch(`/api/boards/recent`);
            const data = await res.json();

            setRecent(data);
        }

        if (boards.length === 0) {
            fetchData();
        }

        if (recent.length === 0) {
            fetchRecent();
        }

        fetchStats();
    }, [boards]);

    return (<>
        <Header boards={boards}/>
        <div className="content">
            <div id="recent-and-stats">
                <Recent posts={recent}></Recent>
                <Stats total={stats.total_posts} content={stats.content} active={stats.most_active}></Stats>
            </div>
            <div id="footer">
                <p>
                    lunachan (v1.0a) - a <a href="https://celestial.host">lunar custom made imageboard.</a>
                    <br></br> 
                    Hand made with <span>❤️</span> by <a href="https://noia.site">noia</a>
                </p>
            </div>
        </div>
    </>)
}