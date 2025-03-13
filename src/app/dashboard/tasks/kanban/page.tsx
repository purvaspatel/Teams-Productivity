"use client";
import { useState } from "react";
import KanbanBoard from "@/components/task/kanbanboard";

export default function Tasklistmanager(){
    const [refresh,setRefresh]=useState(false);
    return(
        <KanbanBoard refresh={refresh} setRefresh={setRefresh}/>
    )
}