import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import "../../App.css";

const Calendar = () => {

  const [goals,setGoals] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  /* =========================================
     LOAD GOALS
  ========================================= */

  useEffect(()=>{
    loadGoals();
  },[]);

  const loadGoals = async () => {

    try{

      setLoading(true);

      const res = await API.get("/goals");

      const data = Array.isArray(res.data) ? res.data : [];

      const sorted = [...data].sort((a,b)=>{

        if(!a?.time || !b?.time) return 0;

        const t1 = new Date(`1970 ${a.time}`);
        const t2 = new Date(`1970 ${b.time}`);

        return t1 - t2;

      });

      setGoals(sorted);

    }catch(err){

      console.error("Calendar load error:",err);
      setError("Failed to load planner");

    }finally{

      setLoading(false);

    }

  };

  /* =========================================
     FORMAT DURATION
  ========================================= */

  const formatDuration = (duration) => {

    const d = Number(duration) || 0;

    if(d >= 60){

      const hrs = Math.floor(d/60);
      const mins = d % 60;

      if(mins === 0) return `${hrs}h`;

      return `${hrs}h ${mins}m`;

    }

    return `${d}m`;

  };

  /* =========================================
     TIMELINE BAR WIDTH
  ========================================= */

  const getBarWidth = (duration) => {

    const d = Number(duration) || 0;

    const base = 140;

    return `${base + d * 2}px`;

  };

  /* =========================================
     STATUS BADGE
  ========================================= */

  const getStatusBadge = (status) => {

    if(status === "completed") return "✅";
    if(status === "skipped") return "⏭";
    return "";

  };

  /* =========================================
     UI
  ========================================= */

  return(

    <div
      style={{
        minHeight:"100vh",
        background:"#dcd4c7",
        paddingTop:"100px"
      }}
    >

      <Navbar/>

      <div style={{width:"85%",margin:"auto"}}>

        <h2
          style={{
            textAlign:"center",
            marginBottom:"40px",
            fontWeight:"700"
          }}
        >
          📅 AI Timeline Planner
        </h2>

        {/* LOADING */}

        {loading &&(

          <div style={{textAlign:"center"}}>
            Loading planner...
          </div>

        )}

        {/* ERROR */}

        {error &&(

          <div style={{textAlign:"center",color:"red"}}>
            {error}
          </div>

        )}

        {/* EMPTY */}

        {!loading && goals.length === 0 &&(

          <div
            style={{
              textAlign:"center",
              opacity:0.6
            }}
          >
            No planner generated yet. Create one in the Chatbot.
          </div>

        )}

        {/* TIMELINE */}

        {!loading && goals.length > 0 &&(

          <div>

            {goals.map((goal)=>(
              
              <div
                key={goal._id}
                style={{
                  display:"flex",
                  alignItems:"center",
                  marginBottom:"22px"
                }}
              >

                {/* TIME */}

                <div
                  style={{
                    width:"110px",
                    fontWeight:"700",
                    fontSize:"15px"
                  }}
                >
                  {goal?.time || "--"}
                </div>

                {/* TIMELINE BAR */}

                <div
                  style={{
                    display:"flex",
                    alignItems:"center",
                    background:goal?.color || "#ccc",
                    padding:"14px 18px",
                    borderRadius:"18px",
                    boxShadow:"0 4px 10px rgba(0,0,0,0.12)",
                    width:getBarWidth(goal?.duration),
                    transition:"0.25s"
                  }}
                >

                  {/* TASK */}

                  <div
                    style={{
                      flex:1,
                      fontWeight:"600"
                    }}
                  >
                    {goal?.title || "Untitled Task"}
                  </div>

                  {/* STATUS */}

                  <div
                    style={{
                      marginRight:"10px",
                      fontSize:"18px"
                    }}
                  >
                    {getStatusBadge(goal?.status)}
                  </div>

                  {/* DURATION */}

                  <div
                    style={{
                      fontSize:"14px",
                      opacity:0.85
                    }}
                  >
                    {formatDuration(goal?.duration)}
                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

};

export default Calendar;