import { requestsApi } from './requestsApi'; 

async function getAllChildRoots() {
    try {
        const response = await requestsApi('https://localhost:5001/api/childroots/GetAllChildRootsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching child roots', error.message);
        throw error;
    }
}

export {getAllChildRoots}