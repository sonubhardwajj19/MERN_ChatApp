export default function Avatar ({userId , username ,online}) {
    const colors = ['bg-red-200','bg-blue-200', 'bg-green-200',  'bg-teal-200', 'bg-purple-200', 'bg-yellow-200', 'bg-sky-200'];
    const userIdBase10 = parseInt(userId,16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];

    return <>
      <div className={"h-10 w-10 rounded-full flex items-center relative border-2 border-gray-300 " + color} >
          <div className="w-full text-center opacity-40 text-lg font-bold  ">{username[0]} </div>
          {online && (
             <div className="h-3.5 w-3.5 bg-green-500 absolute rounded-full bottom-0 right-0 border-2 border-white"></div>
          )}
      </div>
    </>
} 