import { requestsApi } from './requestsApi'; 

async function getAllBranchChildRoots(){
    try {
        const response = await requestsApi('branchmainroots/GetAllBranchMainRootsWithDeletedAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching branch child roots', error.message);
        throw error;
    }
}

async function getOneBranchChildRoot(id){
    try {
        const response = await requestsApi(`branchchildroots/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching branch child root with id : ${id}:`, error.message);
        throw error;
    }
}

async function createBranchChildRoot(branchChildRootData){
    try {
        const response = await requestsApi('branchchildroots',{
            method:'POST',
            body:JSON.stringify(branchChildRootData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating a branch child root', error.message);
        throw error;
    }
}

async function updateBranchChildRoot(id, branchChildRootData){
    try {
        const response = await requestsApi(`branchchildroots/${id}`, {
            method:'PUT',
            body:JSON.stringify(branchChildRootData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating a branch child root', error.message);
        throw error;
    }
}

async function deleteBranchChildRoot(id){
    try {
        const response = await requestsApi(`branchchildroots/${id}`, {
            method:'DELETE',
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting a branch child root:', error.message);
        throw error;
    }
}

export {getAllBranchChildRoots, getOneBranchChildRoot, createBranchChildRoot, updateBranchChildRoot, deleteBranchChildRoot}