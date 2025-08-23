import { useState } from "react";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import '../styles/Tabs.css'; 

export default function Tab() {
  const [refresh, setRefresh] = useState(false);

  const[toggleState, setToggleStage] = useState(1);
  
  const toggleTab = (index) => {
    setToggleStage(index);
  }

  return (
    <div>
        <h1>Task Management System</h1>
      <div className="container">
        <div className="bloc-tabs">
          <button className={toggleState===1? 'tab active-tab': 'tab'} onClick={() => toggleTab(1)}>Tasks</button>
          <button className={toggleState===2? 'tab active-tab': 'tab'} onClick={() => toggleTab(2)}>Add Task</button>
        </div>

        <div className="content-tab">
          <div className={toggleState===1? 'content active-content': 'content'}>
            <TaskList refresh={refresh} />
          </div>
        </div>

        <div className="content-tab">
          <div className={toggleState===2? 'content active-content': 'content'}>
            <TaskForm onTaskAdded={() => setRefresh(!refresh)} />
          </div>
        </div>

      </div>
    </div>
  );
}