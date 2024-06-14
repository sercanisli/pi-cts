import { requestsApi } from './requestsApi'; 

async function getAllConnectionTypes(){
    try {
        const response = await requestsApi('https://localhost:5001/api/connectiontypes/GetAllConnectionTypesAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching connection types', error.message);
        throw error;
    }
}

async function getAllLimitedConnectionTypes(){
    try {
        const response = await fetch('https://localhost:5001/api/connectiontypes/GetAllLimitedConnectionTypesAsync');
        if(!response.ok){
            throw new Error('Failed to fetching all limited connection types');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching all limited connection types: ', error.message);
        throw error;
    }
}

async function getOneConnectionType(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/connectiontypes/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching connection type with id : ${id}:`, error.message);
        throw error;
    }
}

async function createConnectionType(connectionTypeData){
    try {
        const response = await requestsApi('https://localhost:5001/api/connectiontypes', {
            method:'POST',
            body: JSON.stringify(connectionTypeData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating connection type:', error.message);
        throw error;
    }
}

async function updateConnectionType(id, connectionTypeData){
    try {
        const response = await requestsApi (`https://localhost:5001/api/connectiontypes/${id}`, {
            method:'PUT',
            body: JSON.stringify(connectionTypeData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating connection type:', error.message);
        throw error;
    }
}

async function deleteConnectionType(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/connectiontypes/${id}`, {
            method:'DELETE',
        });
        return response.status;
    } catch (error) {
        console.error(`Error deleting connection type`, error.message);
        throw error;
    }
}

export { getAllConnectionTypes, getAllLimitedConnectionTypes, getOneConnectionType, createConnectionType, updateConnectionType, deleteConnectionType }