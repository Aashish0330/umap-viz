import React, { Component} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import LassoSelector from "./components/LassoSelector";
import Data from "./Data";
import NewPlot from "./components/NewPlot";

class App extends Component {
  render() {

    
   
    return (
      <Router>
      <Routes>
        <Route path="/" element={<Data />} /> {/* Home Page */}
        <Route path="/tsne-plot" element={<NewPlot />} /> {/* t-SNE Plot Page */}
      </Routes>
    </Router>
    );
  }
}

export default App;