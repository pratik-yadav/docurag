import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Feature from "./pages/Feature"
import ChatHistory from "./pages/ChatHistory"
import Chats from "./pages/Chats"
import SuggestionHistory from "./pages/SuggestionHistory"
import Suggestion from "./pages/Suggestion"
import Register from "./pages/Register"
import Blank from "./pages/Blank"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/blank" element={<Blank />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/features" element={<Feature />}/>
        <Route path="/chat/:id" element={<Chats />}/>
        <Route path="/suggestion/:id" element={<Suggestion />}/>
        <Route path="/history/suggestions" element={<SuggestionHistory />} />
        <Route path="/history/chats" element={<ChatHistory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
