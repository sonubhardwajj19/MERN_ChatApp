import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm() {
  
    const [username , setUsername] = useState('');
    const [password , setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('register');

    const {setUsername : setLoggedInUsername, setId} = useContext(UserContext)

    async function handleSubmit(e) {
        e.preventDefault();
        const url = isLoginOrRegister === 'register' ? 'register' : 'login';
        const {data} = await axios.post(url, {username,password});

        setLoggedInUsername(username);
        setId(data.id);
  }


    return <>
       <div className="bg-gray-950 h-screen flex items-center">

        <div className="h-screen flex-1/4  p-5 flex items-center ml-10">
          <img  src="./src/images/logo.jpg" alt="A person walking through a park" className="object-fill border-2 border-gray-600 rounded-3xl " />
        </div>

        <div className="flex-1/3 h-full">

           <div className="flex flex-col gap-10 h-full items-center justify-center">
               <span className="text-5xl mb-5 text-gray-300 font-serif italic">CodeRoom</span>
            <form className="w-100 mx-auto " onSubmit={handleSubmit}>
                <input value={username}
                  onChange={(e)=>{setUsername(e.target.value)}}
                  type="text" placeholder="Username" 
                  className="w-full bg-gray-500 block p-3 mb-3 rounded-sm text-white hover:bg-gray-400" />

                <input value={password}
                  onChange={(e)=>(setPassword(e.target.value))}
                  type="password" placeholder="Password"
                  className="w-full bg-gray-500 block p-3 mb-3 text-white rounded-sm hover:bg-gray-400"/>
                <button className="w-full bg-blue-700 p-3 border-none rounded-sm text-white hover:bg-blue-600">
                  {isLoginOrRegister === 'register' ? 'Register'  : 'Login'}  
                </button>

              <div className="text-blue-100 font-normal text-center mt-2">
                  { isLoginOrRegister === 'register' && (
                    <div className="text-gray-400">
                      Already a member ?
                      <button  className="hover:text-blue-600"
                        onClick={()=> setIsLoginOrRegister('login')}>
                          Login here
                      </button>
                    </div>
                  )}

                  { isLoginOrRegister === 'login' && (
                    <div className="text-gray-400">
                      Don't have an acount ?
                      <button className="hover:text-blue-600"
                         onClick={()=> setIsLoginOrRegister('register')}>
                          Register here
                      </button>
                    </div>
                  )}
              </div>
            </form>
           </div>
           

        </div>

       </div>

    </>
}