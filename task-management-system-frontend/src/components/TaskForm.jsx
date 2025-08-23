import { useState } from "react";
import api from "../api";
import '../styles/TaskForm.css';

export default function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if fields are empty
    if(!title || !description) {
      return;
    }

    // Post data to API
    try {
      const response = await api.post("/api/task", { title, description });
      setTitle("");
      setDescription("");
      onTaskAdded(response.data);
      setMessage("Task added successfully!");
      setTimeout(() => setMessage(null), 5000); // Clear message after 5 seconds
    } catch (error) {
        setMessage("Error adding task. Please try again.");
        console.error("Error adding task:", error);
    }
  };

  return (
    <div className="task-form">
        <h2>Add Task</h2>
        <hr />
        <p>{message}</p>
        <form onSubmit={handleSubmit}>
            <input
                name="title"
                type="text"
                placeholder="Enter task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <br/>
            <textarea
                name="description"
                rows="4"
                cols="50"
                placeholder="Enter task description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <br/>
            <button type="submit" className="add-task">Add Task</button>
        </form>
    </div>
  );
}