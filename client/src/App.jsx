import "./App.css";
import Home from "./components/Home";
import { Route, Routes } from "react-router-dom";
import EditorPage from "./components/EditorPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/editor/:roomId" element={<EditorPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
