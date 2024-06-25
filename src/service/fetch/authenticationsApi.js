import { requestsApi } from './requestsApi'; 
import router from '../../router';

async function authenticate(user) {
    try {
        const response = await requestsApi('authentication/login', {
            credentials:'include',  
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        document.cookie = `accessToken=${data.accessToken}`;
        localStorage.setItem('refreshToken', data.refreshToken);
        document.cookie = `refreshToken=${data.refreshToken}`;
        localStorage.setItem('refreshTokenExpiryTime', data.refreshTokenExpiryTime);
        document.cookie =`refreshTokenExpiryTime=${data.refreshTokenExpiryTime}`;
        localStorage.setItem('userName', data.userName);
        document.cookie =`userName=${data.userName}`;
        localStorage.setItem('userPermissions', data.userPermissions);
        document.cookie =`userPermissions=${data.userPermissions}`;
        return data;
    } catch (error) {
        console.error('Error login', error.message);
    }
}


async function logout(user){
    try {
        const response = await requestsApi('authentication/logout',{
            credentials:'include',
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
        if(!response.ok){
            throw new Error('Failed to logout');
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshTokenExpiryTime');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPermissions');
        localStorage.clear();
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshTokenExpiryTime=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userPermissions=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error) {
        console.error('Error logout', error.message);
    }
}

async function refresh(token){
    try {
        const response = await requestsApi('authentication/refresh', {
            credentials:'include',
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(token),
        });
        const data = await response.json();
        if(data.accessToken !== undefined && data.refreshToken !== undefined && data.refreshTokenExpiryTime !== undefined && data.userName !== undefined && data.userPermissions !== undefined ){
            localStorage.setItem('accessToken', data.accessToken);
            document.cookie = `accessToken=${data.accessToken}`;
            localStorage.setItem('refreshToken', data.refreshToken);
            document.cookie = `refreshToken=${data.refreshToken}`;
            localStorage.setItem('refreshTokenExpiryTime', data.refreshTokenExpiryTime);
            document.cookie =`refreshTokenExpiryTime=${data.refreshTokenExpiryTime}`;
            localStorage.setItem('userName', data.userName);
            document.cookie =`userName=${data.userName}`;
            localStorage.setItem('userPermissions', data.userPermissions);
            document.cookie=`userPermissions=${data.userPermissions}`;
        }
        return data;
    } catch (error) {
        console.error('Error refresh', error.message);
    }
}

export { authenticate, logout, refresh }

