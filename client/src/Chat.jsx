import { useRef, useState } from "react";
import { useEffect } from "react"

import Logo from "./Logo";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";

export default function Chat() {

    const [ws, setWs] = useState(null);
    const [onilnePeople , setOnlinePeople] = useState({});
    const [offlinePeople , setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const {username, id, setId, setUsername} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();

    
    function connectToWs () {
        const ws = new WebSocket(import.meta.env.WS_URL);
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close',() => {
            setTimeout(() => {
                console.log('Disconnected, trying to reconnect');
                connectToWs();
            }, 1000);
        })
    }
    
    useEffect(()=>{
         connectToWs();
    },[])

    function handleMessage (ev) {
        const messageData = JSON.parse(ev.data);
    
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        } else if('text' in messageData){
               if(messageData.sender === selectedUserId){
                   setMessages(prev => ([...prev,{...messageData}]));
               }
         }
    }

    function showOnlinePeople (peopleArray){
      const people = {} ;  

      // people object :- have key value pair As long as your key is unique, 
      // each user gets a separate entry

      peopleArray.forEach(({userId,username}) => {
          people[userId] = username;
      })

      setOnlinePeople(people);
    }

    function sendMessage(ev){
        ev.preventDefault();
        ws.send(JSON.stringify({
                recipient : selectedUserId,
                text : newMessageText
        }))
        
        setMessages(prev => ([...prev,{
            text:newMessageText,
            sender:id,
            recipient:selectedUserId,
            _id:Date.now()
        }]))
        setNewMessageText('');
        
    }

    function Logout() {
       axios.post('/logout').then(()=>{
         setWs(null);
         setId(null);
         setUsername(null);
       })
    }
    
    useEffect(()=>{
        const div = divUnderMessages.current;
        if (div){
            div.scrollIntoView({behavior:'smooth',block:'end'})
        }
    },[messages]);

    useEffect(()=>{
        if(selectedUserId){
         axios.get('/messages/'+selectedUserId).then(res=>{
            setMessages(res.data);
            })
        }
    },[selectedUserId]);


    useEffect(()=>{
      axios.get('/people').then(res=>{
        const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onilnePeople).includes(p._id));
        
        const offlinePeople = {};

        offlinePeopleArr.forEach(p=>{
            offlinePeople[p._id] = p;
        })
       setOfflinePeople(offlinePeople);
      })
    },[onilnePeople])
    const onlinePeopleExclOurUser = {...onilnePeople};
    delete onlinePeopleExclOurUser[id];

   const messsagesWihtoutDupes = uniqBy(messages,'_id');

    return <>
    <div className="flex h-screen">

        <div className="bg-white w-1/3 flex flex-col">
        
            <div className="flex-grow">
                <Logo/>
                {Object.keys(onlinePeopleExclOurUser).map(userId => (
                <Contact
                    key={userId}
                    id={userId}
                    online={true}
                    username={onlinePeopleExclOurUser[userId]}
                    onClick={()=> setSelectedUserId(userId)}
                    selected={userId === selectedUserId}
                />
            ))}
                {Object.keys(offlinePeople).map(userId => (
                <Contact
                    key={userId}
                    id={userId}
                    online={false}
                    username={offlinePeople[userId].username}
                    onClick={()=> setSelectedUserId(userId)}
                    selected={userId === selectedUserId}
                />
            ))}
            </div>
            <div className="p-5 text-center flex items-center justify-center">
                <span className="flex mr-4 text-gray-500 items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                    {username}
                </span>
                 <button onClick={Logout}
                    className="bg-blue-100 py-1 px-3 text-gray-500 rounded-sm border cursor-pointer">
                    LogOut
                 </button>
            </div>
        </div>


        <div className="bg-blue-100 w-2/3 p-3 flex flex-col ">

           <div className="flex-grow">
            
                {!selectedUserId && (
                    <div className="flex h-full items-center justify-center">
                    <div className="text-lg text-gray-400">
                        &larr; Select a person to start chatting
                    </div>
                    </div>
                )}

                {!!selectedUserId && (
                
                    <div className="relative h-full ">
                        <div className="p-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent absolute top-0 right-0 left-0 bottom-0">
                            {messsagesWihtoutDupes.map(message => (
                                <div key={message._id} className="flex ">
                                    <div className={"p-2.5 my-2 mr-2  rounded-md text-sm max-w-[80%] break-words inline-block "+ (message.sender === id ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-400 text-white')}>
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={divUnderMessages}></div>
                        </div>
                    </div>
                )}
                
            </div>


           {!!selectedUserId && (
                <form className="flex gap-2 m-5" onSubmit={sendMessage}>
                    <input type="text" placeholder="Type your message here" 
                            value={newMessageText}
                            onChange={e => setNewMessageText(e.target.value)}
                            className="bg-white p-3 border rounded-lg flex-grow" />

                    <button  type="submit"
                            className="bg-blue-500 p-3 text-white rounded-lg ">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                    </button>
                </form>
           )}
           

        </div>
    </div>
    </>
}