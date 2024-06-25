<script>
import {logout, refresh} from './service/fetch/authenticationsApi';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  emits:['routeChange'],
  data() {
    return {
    };
  },
  methods: {
    logoutUser(user){
        this.$emit('routeChange');
        localStorage.clear();
        logout(user);
    },
    refresh(){
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const token ={
            accessToken:accessToken,
            refreshToken:refreshToken
        }
        
        refresh(token);
    },
    checkRefreshTokenExpiry() {
      const refreshTokenExpiryTime = localStorage.getItem('refreshTokenExpiryTime');
      const user = localStorage.getItem('userName');
      if (refreshTokenExpiryTime) {
        const expiryDate = new Date(refreshTokenExpiryTime);
        if (expiryDate <= new Date()) {
          this.logoutUser(user); 
        }
      }
    }
  },
  mounted() {
    setInterval(this.checkRefreshTokenExpiry, 60000); 
    document.addEventListener('click', this.refresh);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.refresh);
  }
}
</script>


<template>
    <router-view />
</template>

<style scoped></style>
