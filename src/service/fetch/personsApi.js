import { requestsApi } from './requestsApi'; 

async function getAllPersons(){
    try {
        const response = await requestsApi('https://localhost:5001/api/persons/GetAllPersonsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching persons', error.message);
        throw error;
    }
}

async function getOnePerson(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/persons/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching person with id: ${id}`);
        throw error;
    }
}

async function createPerson(personData){
    try {
        const response = await requestsApi('https://localhost:5001/api/persons', {
            method:'POST',
            body: JSON.stringify(personData),
        });
        return response.json();
    } catch (error) {
        console.error('Error createing person', error.message);
        throw error;
    }
}

async function updatePerson(id, personData){
    try {
        const response = await requestsApi(`https://localhost:5001/api/persons/${id}`, {
            method:'PUT',
            body:JSON.stringify(personData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating person:', error.message);
        throw error
    }
}

async function deletePerson(id){
    try {
        const response = await requestsApi(`https://localhost:5001/api/persons/${id}`, {
            method:'DELETE'
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting person:', error.message);
        throw error;
    }
}

export { getAllPersons, getOnePerson, createPerson, updatePerson, deletePerson }