import { useRef, useState } from "react";
import { useEffect } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";

export default function Chat() {

    const [ws, setWs] = useState(null);
    const [onilnePeople , setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const {username, id} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();

    useEffect(()=>{
         connectToWs();
    },[])

    function connectToWs () {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close',() => {
            setTimeout(() => {
                console.log('Disconnected, trying to reconnect');
                connectToWs();
            }, 1000);
        })
    }

    function handleMessage (ev) {
        const messageData = JSON.parse(ev.data);
    
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        } else if('text' in messageData){
          setMessages(prev => ([...prev,{...messageData}]));
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
    
    useEffect(()=>{
        const div = divUnderMessages.current;
        if (div){
            div.scrollIntoView({behavior:'smooth',block:'end'})
        }

    },[messages]);

    useEffect(()=>{
      axios.get('/messages/'+selectedUserId).then(res=>{
        setMessages(res.data )
      })
    },[selectedUserId]);

    console.log("hi there")
    useEffect(()=>{
      axios.get('/people').then(res=>{
        const offlinePeople = res.data.filter(p => p._id !== id);
        console.log(offlinePeople)
      })
    },[onilnePeople])

   const onlinePeopleExclOurUser = {...onilnePeople};
   delete onlinePeopleExclOurUser[id];

   const messsagesWihtoutDupes = uniqBy(messages,'_id');

    return <>
    <div className="flex h-screen">

        <div className="bg-white w-1/3 shadow-lg shadow-gray-900">
            <Logo/>
             {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <div  key={userId} onClick={()=> setSelectedUserId(userId)}
                  className={"border-b border-gray-300 flex items-center cursor-pointer "+(selectedUserId === userId ? 'bg-gray-100 rounded-sm' : '')}>
                { selectedUserId === userId && (
                    <span className="h-16 w-1 rounded-r-md bg-blue-500"></span>
                )}

                <div className="flex py-3 pl-4 items-center gap-3">
                   <Avatar online={true} username={onilnePeople[userId]} userId={userId}/> 
                   <span className="text-gray-800">{onilnePeople[userId]}</span>
                </div>
            </div>
           ))}
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