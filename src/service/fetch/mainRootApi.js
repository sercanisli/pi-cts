import { requestsApi } from './requestsApi'; 

async function getAllMainRoots() {
    try {
        const response = await requestsApi('https://localhost:5001/api/mainroots/GetAllMainRootsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching main roots', error.message);
        throw error;
    }
}

async function getOneMainRoot(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/mainroots/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching main root with id : ${id}:`, error.message);
        throw error;
    }
}

async function createMainRoot(mainRootData){
    try {
        const response = await requestsApi('https://localhost:5001/api/mainroots', {
            method:'POST',
            body: JSON.stringify(mainRootData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating main root', error.message);
        throw error;
    }
}

async function updateMainRoot(id, mainRootData){
    try {
        const response = await requestsApi(`https://localhost:5001/api/mainroots/${id}`, {
            method:'PUT',
            body: JSON.stringify(mainRootData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating main root:', error.message);
        throw error;
    }
}

async function deleteMainRoot(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/mainroots/${id}`, {
            method:'DELETE',
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting a main root:', error.message);
        throw error;
    }
}

export { getAllMainRoots, getOneMainRoot, createMainRoot, updateMainRoot, deleteMainRoot }