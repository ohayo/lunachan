import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import './App.css'
import Home from "./pages/home";
import Board from "./pages/board";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={ <Home />} />
          <Route path="/board" element={ <Board />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App