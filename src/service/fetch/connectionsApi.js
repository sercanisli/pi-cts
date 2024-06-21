import { requestsApi } from './requestsApi'; 

async function getAllConnections() {
    try {
        const response = await requestsApi('connections/getAllConnectionsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching connections:', error.message);
        throw error;
    }
}

async function getAllConnectionsByBranchId() {
    try {
        const response = await requestsApi('connections/GetAllConnectionsByBrachIdAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching connections:', error.message);
        throw error;
    }
}

async function getOneConnections(id) {
    try {
        const response = await requestsApi(`connections/${id}`);
        return response.json();
    } catch (error) {
        console.error('Error fetching connection:', error.message);
        throw error;
    }
}

async function createConnection(connectionData) {
    try {
        const response = await requestsApi('connections', {
            method: 'POST',
            body: JSON.stringify(connectionData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating connection:', error.message);
        throw error;
    }
}

async function updateConnection(id, connectionData) {
    try {
        const response = await requestsApi(`connections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(connectionData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating connection:', error.message);
        throw error;
    }
}

async function deleteConnection(id) {
    try {
        const response = await requestsApi(`connections/${id}`, {
            method: 'DELETE',
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting connection:', error.message);
        throw error;
    }
}

export { getAllConnections, getAllConnectionsByBranchId, getOneConnections, createConnection, updateConnection, deleteConnection };