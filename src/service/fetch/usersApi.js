import { requestsApi } from './requestsApi'; 

async function getAllUsers(){
    try {
        const response = await requestsApi('users/GetAllUserAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching users', error.message);
        throw error;
    }
}

async function getAllLimitedUsers(){
    try {
        const response = await requestsApi('users/GetAllLimitedUsersAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching users', error.message);
        throw error;
    }
}

async function getOneUserById(id){
    try {
        const response = await requestsApi(`users/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching user', error.message);
        throw error;
    }
}

async function getOneUserByIdForSettings(id){
    try {
        const response = await requestsApi(`users/${id}`);
        if(!response.ok){
            throw new Error('Failed to Get One User for Settings');
        }
        return response.json()
    } catch (error) {
        console.error('Error fetching get one user for settings:', error.message);
        throw error;
    }
}

async function getOneUserByUserName(userName){
    try {
        const response = await requestsApi('users/GetOneUserByUserNameAsync', {
            method:'POST',
            body: JSON.stringify(userName),
        });
        return response.json();
    } catch (error) {
        console.error('Error fething user:', error.message);
        throw error;
    }
}

async function getOneUserByNameForSettings(userName){
    try {
        const response = await requestsApi('users/GetOneUserByNameForSettingsAsync', {
            method:'POST',
            body: JSON.stringify(userName)
        });
        return response.json();
    } catch (error) {
        console.error('Error fething user:', error.message);
        throw error;
    }
}

async function createOneUser(user){
    try {
        const response = await requestsApi('users', {
            method : 'POST',
            body: JSON.stringify(user),
        });
        return response;

    } catch (error) {
        console.error('Error during create a user', error.message);
        throw error;
    }
}

async function updateUser(id, newUser){
    try {
        const response = await requestsApi(`users/${id}`, {
            method:'PUT',
            body: JSON.stringify(newUser),
        });
        return response.status;
    } catch (error) {
        console.error('Error during editing a user', error.message);
        throw error;
    }
}

async function updateUserForSettings(id, newUser){
    try {
        const response = await requestsApi(`users/UpdateOneUserForSettings/${id}`, {
            method:'PUT',
            body: JSON.stringify(newUser),
        });
        return response.status;
    } catch (error) {
        console.error('Error during editing a user', error.message);
        throw error;
    }
}

async function updateUserStatus(user){
    try {
        const response = await requestsApi('users/UpdateOneUserStatusAsync', {
            method : 'PUT',
            body: JSON.stringify(user)
        });
        return response.status;
    } catch (error) {
        console.error('Error changing a user status:', error.message);
        throw error;
    }
}


async function deleteUser(id){
    try {
        const response = await requestsApi(`users/${id}`, {
            method:'DELETE'
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting users:', error.message);
        throw error;
    }
}

export {getAllUsers, getAllLimitedUsers, getOneUserById, getOneUserByIdForSettings, getOneUserByUserName, getOneUserByNameForSettings, createOneUser, updateUser, updateUserForSettings, updateUserStatus, deleteUser}