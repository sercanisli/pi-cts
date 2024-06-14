async function getAllSearchCounts(){
    try {
        const response = await fetch('https://localhost:5001/api/searchcounts');
        if(!response.ok){
            throw new Error('Failed to fetch search counts');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching Search Count', error.message);
        throw error;
    }
}

async function updateSearchCount(searchCountData){
    try {
        const response = await fetch('https://localhost:5001/api/searchcounts',{
            method:'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchCountData),
        });
        if(!response.status === 204){
            throw new Error('Failed to fetch search counts');
        }
        return response.status;
    } catch (error) {
        console.error('Error updating a Search Count:', error.message);
        throw error;
    }
}

export { getAllSearchCounts, updateSearchCount }