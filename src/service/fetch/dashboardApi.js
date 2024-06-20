import { requestsApi } from './requestsApi'; 

async function getDashboardItemsCount(){
    try {
        const response = await requestsApi('https://localhost:5001/api/dashboard');
        if(!response.ok){
            throw new Error('Failed to fetch dashboard items count');
        }
        const data = response.json();
        return data;
    } catch (error) {
        console.error('Error Dashboard:', error.message);
    }
}

export {getDashboardItemsCount}