import { requestsApi } from './requestsApi'; 

async function getAllProjects(){
    try {
        const response = await requestsApi('projects/GetAllProjectsAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        throw error;
    }
}

async function getAllLimitedProjects(){
    try {
        const response = await requestsApi('projects/GetAllLimitedProjectAsync');
        return response.json();
    } catch (error) {
        console.error('Error fetching limited projects:', error.message);
        throw error;
    }
}

async function getOneProject(id){
    try {
        const response = await requestsApi(`projects/${id}`);
        return response.json();
    } catch (error) {
        console.error(`Error fetching project with id : ${id}:`, error.message);
        throw error;
    }
}

async function createProject(projectData){
    try {
        const response = await requestsApi('projects', {
            method:'POST',
            body: JSON.stringify(projectData),
        });
        return response.json();
    } catch (error) {
        console.error('Error creating project:', error.message);
        throw error;
    }
}

async function updateProject(id, projectData){
    try {
        const response = await requestsApi(`projects/${id}`, {
            method:'PUT',
            body:JSON.stringify(projectData),
        });
        return response.status;
    } catch (error) {
        console.error('Error updating project:', error.message);
        throw error;
    }
}

async function deleteProject(id){
    try {
        const response = await requestsApi(`projects/${id}`, {
            method:'DELETE'
        });
        return response.status;
    } catch (error) {
        console.error('Error deleting a project:', error.message);
        throw error;
    }
}

export { getAllProjects, getAllLimitedProjects, getOneProject, createProject, updateProject, deleteProject}