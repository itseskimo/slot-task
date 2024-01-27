
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Physioview from './sections/Physioview'
function App() {


  return (
    <>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Auth />} /> */}
          <Route path="/physio" element={<Physioview />} />

        </Routes>
      </Router>
    </>
  )
}

export default App
