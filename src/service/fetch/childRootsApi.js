import { requestsApi } from './requestsApi'; 

async function getAllChildRoots() {
    try {
        const response = await requestsApi('childroots/GetAllChildRootsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching child roots', error.message);
        throw error;
    }
}

export {getAllChildRoots}