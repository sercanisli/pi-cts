import { requestsApi } from './requestsApi'; 

async function getAllUserBranches(id){
    try {
        const response = await requestsApi(`userbranches/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching user branches', error.message);
        throw error;
    }
}

async function updateUserBranches(id, newUserBranches) {
    try {
        const response = await requestsApi(`userbranches/${id}`, {
            method:'PUT',
            body: JSON.stringify(newUserBranches),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a user branches', error.message);
        throw error;
    }
}

export { getAllUserBranches, updateUserBranches }