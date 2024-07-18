import { requestsApi } from './requestsApi'; 

async function getAllTasks(){
    try {
        const response = await requestsApi('tasks/GetAllTasksAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        throw error;
    }
}

async function getAllTasksByProjectId(id){
    try {
        const response = await requestsApi(`tasks/GetAllTasksByProjectIdAsync/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        throw error;
    }
}

async function getOneTask(id){
    try {
        const response = await requestsApi(`tasks/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching project with id : ${id}:`, error.message);
        throw error;
    }
}

async function createTask(taskData){
    try {
        const response = await requestsApi('tasks', {
            method:'POST',
            body: JSON.stringify(taskData)
        });
        return response.json();
    } catch (error) {
        console.error('Error creating task:', error.message);
        throw error;
    }
}

async function updateTask(id, taskData){
    try {
        const response = await requestsApi(`tasks/${id}`, {
            method:'PUT',
            body: JSON.stringify(taskData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating task:', error.message);
        throw error;
    }
}

async function updateTaskStatus(task){
    try {
        const response = await requestsApi('tasks/UpdateTaskStatusAsync', {
            method:'PUT',
            body:JSON.stringify(task)
        });
        return response.status;
    } catch (error) {
        console.error('Error changing a task status:', error.message);
        throw error;
    }
}

async function updateTaskProgress(task){
    try {
        const response = await requestsApi('tasks/UpdateTaskProgressAsync', {
            method:'PUT',
            body:JSON.stringify(task)
        });
        return response.status;
    } catch (error) {
        console.error('Error changing a task progress:', error.message);
        throw error;
    }
}

async function deleteTask(id,projectId){
    try {
        const response = await requestsApi(`tasks/${id}`, {
            method:'DELETE',
            body: JSON.stringify(projectId)
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting a task:', error.message);
        throw error;
    }
}

export { getAllTasks, getAllTasksByProjectId, getOneTask, createTask, updateTask, updateTaskStatus, updateTaskProgress, deleteTask}