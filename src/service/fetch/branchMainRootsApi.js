import { requestsApi } from './requestsApi'; 

async function getAllBranchMainRoots() {
    try {
        const response = await requestsApi('https://localhost:5001/api/branchmainroots/GetAllBranchMainRootsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching branch main roots', error.message);
        throw error;
    }
}

async function getOneBranchMainRoot(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/branchmainroots/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching branch main root with id : ${id}:`, error.message);
        throw error;
    }
}

async function createBranchMainRoot(branchMainRootData){
    try {
        const response = await requestsApi('https://localhost:5001/api/branchmainroots', {
            method:'POST',
            body: JSON.stringify(branchMainRootData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating a branch main root', error.message);
        throw error;
    }
}

async function updateBranchMainRoot(id, branchMainRootData){
    try {
        const response = await requestsApi(`https://localhost:5001/api/branchmainroots/${id}`, {
            method:'PUT',
            body: JSON.stringify(branchMainRootData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a branch main root:', error.message);
        throw error;
    }
}

async function deleteBranchMainRoot(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/branchmainroots/${id}`, {
            method:'DELETE',
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting a branch main root:', error.message);
        throw error;
    }
}

export {getAllBranchMainRoots, getOneBranchMainRoot, createBranchMainRoot, updateBranchMainRoot, deleteBranchMainRoot}