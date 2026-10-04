import './App.css'
import axios from "axios";
import Routes from './Routes';
import UserContextProvider from "./UserContext"


function App() {
  axios.defaults.baseURL = import.meta.env.API_URL;
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
