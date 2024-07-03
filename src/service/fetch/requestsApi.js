import router from '@/router'

function redirectTo(status) {
    switch (status) {
        case 401:
            router.push({ name: 'login'});
            break;
        case 403:
            router.push({ name: 'accessDenied'});
            break;
        default:
            break;
    }
}

async function requestsApi(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
        const credentials= 'include';
        const headers= {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
        options = {
            headers:headers,
            credentials:credentials,
            ...options
        }
        const response = await fetch('/api/'+url, options); 
        redirectTo(response.status);
        return response;
}

export {requestsApi}