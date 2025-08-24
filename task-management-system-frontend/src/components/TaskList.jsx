import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { AgGridReact } from "ag-grid-react";
import { provideGlobalGridOptions, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../styles/TaskList.css';

export default function TaskList({refresh}) {
    // Backend base url
    const BASE_URL = "https://localhost:7240";

    // To use ag-grid
    ModuleRegistry.registerModules([ AllCommunityModule, SetFilterModule ]);
    provideGlobalGridOptions({
        theme: "legacy",
    });

    // State management
    const [rowData, setRowData] = useState([]);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

  // Fetch tasks from API
  const fetchTasks = async () => {
        try {
            // Set loading
            setLoading(true);

            // Call API to fetch tasks
            const response = await fetch(`${BASE_URL}/api/task`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if response is successful
            if (!response.ok) {
                setMessage("Error fetching tasks. Please try again.");
                console.error("Error fetching tasks:", error);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check if response has content
            const text = await response.text();
            
            // Parse JSON response
            const data = text ? JSON.parse(text) : [];
            data.forEach(task => {
                task.completed = task.isCompleted ? "Completed" : "Pending"; 
            });

            // Set the row data for ag-grid
            setRowData(data);
            setError(null);

        } catch (err) {
            console.log(err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTasks();
    }, [refresh]);
    
    // Update status
    const handleToggleCompleted = async (task) => {
        try {
            // Set loading
            setLoading(true);

            // Set task completion status
            if(task.isCompleted)
                task.isCompleted = false;
            else
                task.isCompleted = true;

            // Call API to update status
            const response = await fetch(`${BASE_URL}/api/task/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
            });

            // Check if response is successful
            if (!response.ok){
                setMessage("Error updating status. Please try again.");
                console.error("Error updating status:", error);
                throw new Error("Failed to update status");
            } 

            // Show success message
            setMessage("Task status updated!");
            setTimeout(() => setMessage(null), 5000); // Clear message after 5 seconds

            // Load updated tasks
            await fetchTasks();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Custom cell renderers for Completed status
    const CompletedComponent = p => {
        return (
            <span
                style={{
                    cursor: "pointer",
                    color: p.value === "Completed" ? "green" : "red",
                    fontWeight: "bold"
                }}
                title="Click to toggle status"
                onClick={() => handleToggleCompleted(p.data)}
            >
                {p.value}
            </span>
        );
    };

    // Custom cell renderers for View button
    const ViewComponent = p =>{
        return<>
        <button onClick={() =>{
            setSelectedTask(p.data);
            setShowViewModal(true);
        }}>View</button>
        </>
    }

    // View modal for displaying task details
    const ViewModal = ({ task, onClose }) => (
        <div className="viewContainer">
            <div className="viewContent">
                <h3 className="viewTitle">Task Details</h3>
                <hr/>
                <div className="viewRow">
                    <span className="viewLabel">ID:</span> {task.id}
                </div>
                <div className="viewRow">
                    <span className="viewLabel">Title:</span> {task.title}
                </div>
                <div className="viewRow">
                    <span className="viewLabel">Description:</span> {task.description}
                </div>
                <div className="viewRow">
                    <span className="viewLabel">Completed:</span> {task.completed}
                </div>
                <div className="viewRow">
                    <span className="viewLabel">Created At:</span> {new Date(task.dateCreated).toLocaleString()}
                </div>
                <div className="viewRow">
                    <span className="viewLabel">Updated At:</span> {new Date(task.dateUpdated).toLocaleString()}
                </div>
                <div className="viewButton">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );

    // Edit task function
    const handleEditSave = async (updatedTask) => {
        try {
            // Set loading
            setLoading(true);

            // Call API to update task
            const response = await fetch(`${BASE_URL}/api/task/${updatedTask.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });

            // Check if response is successful
            if (!response.ok){
                setMessage("Error updating task. Please try again.");
                console.error("Error updating task:", error);
                throw new Error("Failed to update task");
            } 

            // Show success message
            setMessage("Task updated successfully!");
            setTimeout(() => setMessage(null), 5000); // Clear message after 5 seconds

            // Close edit modal
            setShowEditModal(false);
            setSelectedTask(null);

            // Load updated tasks
            await fetchTasks();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit modal for editing task details
    const EditModal = ({ task, onClose, onSave }) => {
        // State for form fields
        const [title, setTitle] = useState(task.title);
        const [description, setDescription] = useState(task.description);

        // Handle form submission
        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({ ...task, title, description });
        };

        // Form container
        return (
            <div className="editDiv">
                <form onSubmit={handleSubmit}>
                    <h3 className="editTitle">Edit Task</h3>
                    <hr/>
                    <div>
                        <label>Title:</label>
                        <br/>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label>Description:</label>
                        <br/>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="editButtons">
                        <button type="submit">Save</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    };

    // Custom cell renderers for Edit button
    const EditComponent = p =>{
        return<>
        <button onClick={()=>{
            setSelectedTask(p.data);
            setShowEditModal(true);
        }}>Edit</button>
        </>
    }

    // Delete task function
    const deleteComponentCall = async (id) => {
        try{
            // Set loading
            setLoading(true);

            // Call API to delete task
            const response = await fetch(`${BASE_URL}/api/task/${id}`, {
                method: 'DELETE'
            });

            // Check if response is successful
            if (!response.ok) {
                setMessage("Error deleting task. Please try again.");
                console.error("Error adding task:", error);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Show success message
            setMessage("Task deleted successfully!");
            setTimeout(() => setMessage(null), 5000); // Clear message after 5 seconds
            
            // Refresh the list after delete
            await fetchTasks();
        }catch (err) {
            console.log(err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Custom cell renderers for Delete button
    const DeleteComponent = p =>{
        return<>
        <button onClick={() => deleteComponentCall(p.data.id)}>Delete</button>
        </>
    }

    // Default column definitions
    const defaultColDef = useMemo(()=>{
        return {
        sortable: true,
        filter: true,
        resizable: true,
        flex:1,
        floatingFilter: true
        };
    });

    // Column definitions for ag-grid
    const [columnDefs, setColumnDefs] = useState([
        { headerName: "ID", field: "id"},
        { headerName: "Title", field: "title" },
        { headerName: "Description", field: "description" },
        { headerName: "Completed", field: "completed", minWidth: 120, filter:"agSetColumnFilter", filterParams:{values:["Completed","Pending"]}, cellRenderer: CompletedComponent },
        { headerName: "View", field: "view", sortable: false, filter: false, cellRenderer: ViewComponent},
        { headerName: "Edit", field: "edit", sortable: false, filter: false, cellRenderer: EditComponent},
        { headerName: "Delete", field: "delete", sortable: false, filter: false, cellRenderer: DeleteComponent}
    ]);

    // Show loading message while fetching data
    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    // Show error message while fetching data
    if (error) {
        return <div className="error"><b>Error:</b> {error}. Please try again later.</div>;
    }

    
  return (
    <div>
      <h2>Tasks</h2>
      <hr />

      <div>
        <p>{message}</p>
        {rowData.length === 0 ? (
            <div className="no-tasks">
            No tasks found.
            </div>
        ) : (
            <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
            <AgGridReact
            theme="legacy"
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                pagination={true}
                paginationPageSize={20}
                paginationPageSizeSelector={[10,20]}
            />
            </div>
        )}
      </div>
      {showEditModal && selectedTask && (
            <EditModal
                task={selectedTask}
                onClose={() => { setShowEditModal(false); setSelectedTask(null); }}
                onSave={handleEditSave}
            />
        )}
        {showViewModal && selectedTask && (
            <ViewModal
                task={selectedTask}
                onClose={() => { setShowViewModal(false); setSelectedTask(null); }}
            />
        )}
    </div>
  );
}