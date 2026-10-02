import Avatar from "./Avatar";

export default function Contact ({id,onClick,username,selected,online}) {

    return <>
        <div  key={id} onClick={()=> onClick(id)}
                  className={"border-b border-gray-300 flex items-center cursor-pointer "+(selected ? 'bg-gray-100 rounded-sm' : '')}>
                { selected && (
                    <span className="h-16 w-1 rounded-r-md bg-blue-500"></span>
                )}

            <div className="flex py-3 pl-4 items-center gap-3">
                <Avatar online={online} username={username} userId={id}/> 
                <span className="text-gray-800">{username}</span>
            </div>
        </div>
    </>
}