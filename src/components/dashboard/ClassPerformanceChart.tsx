"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function ClassPerformanceChart({data}:any){

  return(

    <ResponsiveContainer width="100%" height={250}>

      <BarChart data={data}>

        <XAxis dataKey="class"/>

        <Tooltip/>

        <Bar dataKey="score" radius={[6,6,0,0]}/>

      </BarChart>

    </ResponsiveContainer>

  )
}