import { requestsApi } from './requestsApi'; 

async function getAllCompanies() {
    try {
        const response = await requestsApi('companies/GetAllCompaniesAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching companies', error.message);
        throw error;
    }
}

async function getAllLimitedCompanies(){
    try {
        const response = await requestsApi('companies/GetAllLimitedCompaniesAsync');
        const data = response.json();
        return data;
    } catch (error) {
        console.error('Error fething limited companies:', error.message);
    }
}

async function getOneCompany(id){
    try {
        const response = await requestsApi(`companies/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching company with id : ${id} :`, error.message);
        throw error;
    }
}

async function createCompany(companyData){
    try {
        const response = await requestsApi('companies', {
            method: 'POST',
            body: JSON.stringify(companyData),
        });
        return response.json();
    } catch (error){
        console.error('Error creating company:', error.message);
        throw error;
    }
}

async function updateCompany(id, companyData) {
    try {
        const response = await requestsApi(`companies/${id}`, {
            method:'PUT',
            body: JSON.stringify(companyData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating company:', error.message);
        throw error;
    }
}

async function deleteCompany(id){
    try {
        const response = await requestsApi(`companies/${id}`,{
            method:'DELETE',
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting company:', error.message);
        throw error;
    }
}

export { getAllCompanies, getAllLimitedCompanies, getOneCompany, createCompany, updateCompany, deleteCompany }