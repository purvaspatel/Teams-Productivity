"use client";
import { useState } from "react";
import TaskList from "@/components/task/TaskList";

export default function Tasklistmanager(){
    const [refresh,setRefresh]=useState(false);
    return(
        <TaskList refresh={refresh} setRefresh={setRefresh}/>
    )
}