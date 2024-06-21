import { requestsApi } from './requestsApi'; 

async function getAllBranches() {
    try {
        const response = await requestsApi('branches/GetAllBranchesAsync', );
        return response.json();;
    } catch (error) {
        console.error('Error fetching branches', error.message);
        throw error;
    }
}

async function getAllLimitedBranches(){
    try {
        const response = await requestsApi('branches/GetAllLimitedBranchesAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching all limited branches:', error.message);
        throw error;
    }
}

async function getOneBranch(id) {
    try {
        const response = await requestsApi(`branches/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching branch with id : ${id}`, error.message);
        throw error;
    }
}

async function createBranch(branchData) {
    try {
        const response = await requestsApi('branches', {
            method: 'POST',
            body: JSON.stringify(branchData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating branch', error.message);
        throw error;
    }
}

async function updateBranch(id, branchData) {
    try {
        const response = await requestsApi(`branches/${id}`, {
            method: 'PUT',
            body: JSON.stringify(branchData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating branch:', error.message);
        throw error;
    }
}

async function deleteBranch(id) {
    try {
        const response = await requestsApi(`branches/${id}`, {
            method: 'DELETE'
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting branch:', error.message);
        throw error;
    }
}

export { getAllBranches, getAllLimitedBranches, getOneBranch, createBranch, updateBranch, deleteBranch}