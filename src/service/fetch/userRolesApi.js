import { requestsApi } from './requestsApi'; 

async function getAllUserRoles(id){
    try {
        const response = await requestsApi(`userroles/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching user roles', error.message);
        throw error;
    }
}

async function updateUserRole(newUserRoles){
    try {
        const response = await requestsApi('userroles', {
            method:'PUT',
            body: JSON.stringify(newUserRoles),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a user roles', error.message);
        throw error;
    }
}

export { getAllUserRoles, updateUserRole }