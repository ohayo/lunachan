import '../assets/styles/header.css'
import { Link } from "react-router-dom";

export default function Header(props) {
    return (
        <div className="header">
            <div className="boards">
                <Link to="/" className="go-home">lunachan</Link>
                <br />
                {props.boards.map((board, index) => {
                    return (
                        <Link to={`/board?name=${board}`} className="no-underline" key={index}>/{board}/</Link>
                    );
                })}
            </div>
            <div className="theme">
                <select id="themeSelector">
                    <option value="magenta">Magenta</option>
                </select>
            </div>
        </div>
    )
}