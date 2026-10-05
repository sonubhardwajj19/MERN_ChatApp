import './App.css'
import axios from "axios";
import Routes from './Routes';
import UserContextProvider from "./UserContext"


function App() {
  const apiUrl = import.meta.env.VITE_API_URL;

  axios.defaults.baseURL = apiUrl;
  axios.defaults.withCredentials = true ;

  return (
    <>
      <UserContextProvider>
        <Routes/>
      </UserContextProvider>
    </>
  )
}

export default App
