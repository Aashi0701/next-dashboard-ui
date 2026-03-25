export default function TeacherActivity(){

  const activities = [

    {text:"Marked attendance for Grade 1",time:"10 min ago"},
    {text:"Created assignment - Math HW",time:"30 min ago"},
    {text:"Reviewed exam results",time:"1 hr ago"}

  ]

  return(

    <div className="flex flex-col gap-3">

      {activities.map((a,i)=>(
        <div key={i} className="flex justify-between text-sm">

          <span className="text-gray-700">
            {a.text}
          </span>

          <span className="text-gray-400">
            {a.time}
          </span>

        </div>
      ))}

    </div>
  )
}