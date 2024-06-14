import { requestsApi } from './requestsApi'; 

async function getAllBranches() {
    try {
        const response = await requestsApi('https://localhost:5001/api/branches/GetAllBranchesAsync', {
        });
        return response.json();;
    } catch (error) {
        console.error('Error fetching branches', error.message);
        throw error;
    }
}

async function getAllLimitedBranches(){
    try {
        const response = await fetch('https://localhost:5001/api/branches/GetAllLimitedBranchesAsync');
        if(!response.ok){
            throw new Error('Failed to fetching all limited branches');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching all limited branches:', error.message);
        throw error;
    }
}

async function getOneBranch(id) {
    try {
        const response = await requestsApi(`https://localhost:5001/api/branches/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching branch with id : ${id}`, error.message);
        throw error;
    }
}

async function createBranch(branchData) {
    try {
        const response = await requestsApi('https://localhost:5001/api/branches', {
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
        const response = await requestsApi(`https://localhost:5001/api/branches/${id}`, {
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
        const response = await requestsApi(`https://localhost:5001/api/branches/${id}`, {
            method: 'DELETE'
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting branch:', error.message);
        throw error;
    }
}

export { getAllBranches, getAllLimitedBranches, getOneBranch, createBranch, updateBranch, deleteBranch}