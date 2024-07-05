import { requestsApi } from './requestsApi'; 

async function getAllTaskUsers(id){
    try {
        const response = await requestsApi(`taskusers/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching task users:', error.message);
        throw error;
    }
}

async function updateTaskUsers(newTaskUser){
    try {
        const response = await requestsApi('taskusers', {
            method:'PUT',
            body:JSON.stringify(newTaskUser),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a task users:', error.message);
        throw error;
    }
}

export {getAllTaskUsers, updateTaskUsers}