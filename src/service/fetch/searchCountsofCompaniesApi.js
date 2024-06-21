import { requestsApi } from './requestsApi'; 

async function getAllSearchCountsofCompanies(){
    try {
        const response = await requestsApi('searchcountsofcompanies');
        if(!response.ok){
            throw new Error('Failed to fetch search counts of companies');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching Search counts of companies', error.message);
        throw error;
    }
}

async function updateSearchCountsofCompanies(searchcountsofcompanies){
    try {
        const response = await requestsApi('searchcountsofcompanies',{
            method:'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchcountsofcompanies),
        });
        if(!response.status === 204){
            throw new Error('Failed to fetch search counts of companies');
        }
        return response.status;
    } catch (error) {
        console.error('Error updating a Search Counts of Companies', error.message);
        throw error;
    }
}

export { getAllSearchCountsofCompanies, updateSearchCountsofCompanies }