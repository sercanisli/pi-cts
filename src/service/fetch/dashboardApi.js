import { requestsApi } from './requestsApi'; 

async function getDashboardItemsCount(){
    try {
        const response = await requestsApi('dashboard');
        const data = response.json();
        return data;
    } catch (error) {
        console.error('Error Dashboard:', error.message);
    }
}

export {getDashboardItemsCount}