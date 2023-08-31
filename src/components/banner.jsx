import '../assets/styles/banner.css'

export default function Banner(props) {
    return (
        <div className="banner">
            {props.image ? <img src={props.image}></img> : <a href="mailto:contact@lunachan.org" className="no-underline banner-link-notice">This board needs a banner image. Think you have what it takes?</a>}
            <h1>{props.name}</h1>
            {props.description ? <p>{props.description}</p> : <></>}
        </div>
    )
}