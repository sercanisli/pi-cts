<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import logo from '../assets/logo/logo.png';
import { logout } from '../service/fetch/authenticationsApi';
import  AppConfig  from './AppConfig.vue'

const { layoutConfig, onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const user = ref(true);
const showConfig = ref(false);

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return logo;
});

const onEditClick = () => {
    getUserInfoFromJWT();
    topbarMenuActive.value = false;
    if (user && user.value !== true) {
        router.push({ path: '/auth/settings', query: { user: user.value } });
    } else {
        router.push('/auth/login');
    }
};

const onSettingsClick = () => {
    showConfig.value = true;
}

const pushToLogin = () => {
    logoutUser();
    router.push('/auth/login');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiryTime');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPermissions');
    document.cookie = 'accessToken=';
    document.cookie = 'refreshToken=';
    document.cookie = 'refreshTokenExpiryTime=';
    document.cookie = 'userName=';
    document.cookie = 'userPermissions='
};

const logoutUser = () => {
    const user = localStorage.getItem('userName');
    logout(user);
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const getUserInfoFromJWT = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        const userInfo = parseJWT(token);
        const username = getUsernameFromUserInfo(userInfo);
        user.value = username;
    } else {
        router.push('/auth/login');
    }
};

const parseJWT = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
};
const getUsernameFromUserInfo = (userInfo) => {
    return userInfo['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
            <span>CTS</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button :model="items" class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onSettingsClick()" class="p-link layout-topbar-button">
                <i class="pi pi-cog"></i>
                <span>Settings</span>
            </button>
            <button @click="onEditClick()" class="p-link layout-topbar-button">
                <i class="pi pi-user-edit"></i>
                <span>Settings</span>
            </button>
            <div>
                <button v-if="user" @click="pushToLogin()" class="p-link layout-topbar-button">
                    <i class="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
        <div v-if="showConfig">
            <AppConfig showConfig/>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
