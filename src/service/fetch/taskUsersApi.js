import { requestsApi } from './requestsApi'; 

async function getAllTaskUsers(id) {
    try {
        const response = await requestsApi(`taskusers/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching task users:', error.message);
        throw error;
    }
}   

async function getAllUserTasks(userId) {
    try {
        const response = await requestsApi("taskusers/GetAllUserTasksByUserIdAsync", {
            method:'POST',
            body:JSON.stringify(userId),
        })
        return response.json();
    } catch (error) {
        console.error('Error fetching user tasks:', error.message);
        throw error;
    }
}

async function updateTaskUsers(id, newTaskUser){
    try {
        const response = await requestsApi(`taskusers/${id}`, {
            method:'PUT',
            body:JSON.stringify(newTaskUser),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a task users:', error.message);
        throw error;
    }
}


async function updateTaskSaw(user){
    try {
        const response = await requestsApi('taskusers/UpdateOneTaskSawAsync', {
            method:'PUT',
            body:JSON.stringify(user),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a user tasks saw', error.message);
        throw error;
    }
}

export {getAllTaskUsers, getAllUserTasks, updateTaskUsers, updateTaskSaw}