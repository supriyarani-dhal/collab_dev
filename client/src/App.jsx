
import Home from "./components/Home";
import { Route, Routes } from "react-router-dom";
import EditorPage from "./components/EditorPage";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route
          path="/editor/:roomId"
          element={
            <ErrorBoundary>
              <EditorPage />
            </ErrorBoundary>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
