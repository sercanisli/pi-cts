<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import logo from '../assets/logo/logo.png';
import { logout } from '../service/fetch/authenticationsApi';
import { usePrimeVue } from 'primevue/config';
import { getOneUserByUserName } from '../service/fetch/usersApi';
import { getAllUserTasks, updateTaskSaw } from '../service/fetch/taskUsersApi';
import { getAllLimitedProjects } from '../service/fetch/projectsApi';
import { updateTaskStatus } from '../service/fetch/tasksApi';
import { useToast } from 'primevue/usetoast';

defineProps({
    simple: {
        type: Boolean,
        default: false
    }
});

const $primevue = usePrimeVue();
const toast = useToast();
const inputStyle = computed(() => $primevue.config.inputStyle || 'outlined');

const { layoutConfig, onMenuToggle, setScale } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const user = ref(true);
const showConfig = ref(false);
const bellDialog = ref(false);
const tasks = ref([]);
const projects = ref([]);
const hasNotifications = ref(false);

const scales = ref([12, 13, 14, 15, 16]);
const visible = ref(false);
const inputStyles = ref([
    { label: 'Outlined', value: 'outlined' },
    { label: 'Filled', value: 'filled' }
]);
const menuModes = ref([
    { label: 'Static', value: 'static' },
    { label: 'Overlay', value: 'overlay' }
]);
const compactMaterial = ref(false);
const primaryFocusRing = ref(true);

onBeforeMount(() => {
    getUser();
    tasksSaw();
});

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

const onChangeTheme = (theme, mode) => {
    $primevue.changeTheme(layoutConfig.theme.value, theme, 'theme-css', () => {
        layoutConfig.theme.value = theme;
        layoutConfig.darkTheme.value = mode;
    });
};
const decrementScale = () => {
    setScale(layoutConfig.scale.value - 1);
    applyScale();
};
const incrementScale = () => {
    setScale(layoutConfig.scale.value + 1);
    applyScale();
};
const applyScale = () => {
    document.documentElement.style.fontSize = layoutConfig.scale.value + 'px';
};
const onInputStyleChange = (value) => {
    $primevue.config.inputStyle = value;
};
const onMenuModeChange = (value) => {
    layoutConfig.menuMode.value = value;
};
const onRippleChange = (value) => {
    layoutConfig.ripple.value = value;
};
const onDarkModeChange = (value) => {
    const newThemeName = value ? layoutConfig.theme.value.replace('light', 'dark') : layoutConfig.theme.value.replace('dark', 'light');

    layoutConfig.darkTheme.value = value;
    onChangeTheme(newThemeName, value);
};
const changeTheme = (theme, color) => {
    let newTheme, dark;

    newTheme = theme + '-' + (layoutConfig.darkTheme.value ? 'dark' : 'light');

    if (color) {
        newTheme += '-' + color;
    }

    if (newTheme.startsWith('md-') && compactMaterial.value) {
        newTheme = newTheme.replace('md-', 'mdc-');
    }

    dark = layoutConfig.darkTheme.value;

    onChangeTheme(newTheme, dark);
};
const isThemeActive = (themeFamily, color) => {
    let themeName;
    let themePrefix = themeFamily === 'md' && compactMaterial.value ? 'mdc' : themeFamily;

    themeName = themePrefix + (layoutConfig.darkTheme.value ? '-dark' : '-light');

    if (color) {
        themeName += '-' + color;
    }

    return layoutConfig.theme.value === themeName;
};
const onCompactMaterialChange = (value) => {
    compactMaterial.value = value;

    if (layoutConfig.theme.value.startsWith('md')) {
        let tokens = layoutConfig.theme.value.split('-');

        changeTheme(tokens[0].substring(0, 2), tokens[2]);
    }
};
const onFocusRingColorChange = (value) => {
    primaryFocusRing.value = value;
    let root = document.documentElement;

    if (value) {
        if (layoutConfig.darkTheme.value) root.style.setProperty('--p-focus-ring-color', 'var(--primary-500)');
        else root.style.setProperty('--p-focus-ring-color', 'var(--primary-500)');
    } else {
        if (layoutConfig.darkTheme.value) root.style.setProperty('--p-focus-ring-color', 'var(--surface-500)');
        else root.style.setProperty('--p-focus-ring-color', 'var(--surface-900)');
    }
};

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

const getUser = async () => {
    const userName = localStorage.getItem('userName');
    const requestUser = {
        userName:userName
    }
    const user = await getOneUserByUserName(requestUser);
    return user;
}


const tasksSaw = async () => {
    
    const user = await getUser();
    const requestForTasks = {
        userId:user.id
    }
    const userTasks = await getAllUserTasks(requestForTasks);
    let taskCount = 0;

    userTasks.forEach(uT => {
        if(uT.taskSaw === false){
            taskCount=taskCount+1;
        }
    });
    if(taskCount>0){
        hasNotifications.value = true;
    }
}


const onBellClick = async () => {
    const user = await getUser();
    
    const requestForTasks = {
        userId:user.id
    }
    const userTasks = await getAllUserTasks(requestForTasks);
    tasks.value = userTasks;

    projects.value = await getAllLimitedProjects();

    if(hasNotifications.value === true) {
        await updateTaskSaw(requestForTasks);
        hasNotifications.value = false;
    }

    bellDialog.value = !bellDialog.value;
};

const getProjectName = (id) => {
    return projects.value.find((p) => p.id == id).projectName;
}

const updateTaskStat = async (data) => {
   try {
    const newTaskStatus = {
        id:data.taskId,
        isCompleted:data.taskIsCompleted
    }
    const response = await updateTaskStatus(newTaskStatus);
    if(response === 204){
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Task status updated', life: 3000 });
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update task status', life: 3000 });
    }
   } catch (error) {
        console.error('Error updating task status:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update task status', life: 3000 });
   }
}

const onSettingsClick = () => {
    visible.value = !visible.value;
};

const pushToLogin = () => {
    logoutUser();
    router.push('/auth/login');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refreshTokenExpiryTime');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPermissions');
    localStorage.clear();
    document.cookie = 'accessToken=';
    document.cookie = 'refreshToken=';
    document.cookie = 'refreshTokenExpiryTime=';
    document.cookie = 'userName=';
    document.cookie = 'userPermissions=';
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
            <img style="height: 50px" :src="logoUrl" alt="logo" />
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button :model="items" class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>
        <div class="layout-topbar-menu" :class="topbarMenuClasses">
                <div v-if="hasNotifications">
                    <button @click="onBellClick()" class="p-link layout-topbar-button">
                        <i v-badge.danger class="pi pi-bell"></i>
                        <span > <p class="spanDiv"> Bildirim</p> </span>
                    </button>
                </div>
                <div v-else>
                    <button @click="onBellClick()" class="p-link layout-topbar-button">
                        <i class="pi pi-bell"></i>
                        <span > <p class="spanDiv"> Bildirim</p> </span>
                    </button>
                </div>
            <button @click="onSettingsClick()" class="p-link layout-topbar-button">
                <i class="pi pi-cog"></i>
                <span><p class="spanDiv"> Tema Ayarları </p></span>
            </button>
            <button @click="onEditClick()" class="p-link layout-topbar-button">
                <i class="pi pi-user-edit"></i>
                <span><p class="spanDiv"> Kullanıcı Ayarları </p></span>
            </button>
            <div>
                <button v-if="user" @click="pushToLogin()" class="p-link layout-topbar-button">
                    <i class="pi pi-sign-out"></i>
                    <span><p class="spanDiv"> Çıkış </p></span>
                </button>
            </div>
        </div>
    </div>
    <Sidebar v-model:visible="visible" position="right" class="layout-config-sidebar w-26rem" pt:closeButton="ml-auto">
        <div class="p-2">
            <section class="pb-4 flex align-items-center justify-content-between border-bottom-1 surface-border">
                <span class="text-xl font-semibold">Scale</span>
                <div class="flex align-items-center gap-2 border-1 surface-border py-1 px-2" style="border-radius: 30px">
                    <Button icon="pi pi-minus" @click="decrementScale" text rounded :disabled="layoutConfig.scale.value === scales[0]" />
                    <i v-for="s in scales" :key="s" :class="['pi pi-circle-fill text-sm text-200', { 'text-lg text-primary': s === layoutConfig.scale.value }]" />

                    <Button icon="pi pi-plus" @click="incrementScale" text rounded :disabled="layoutConfig.scale.value === scales[scales.length - 1]" />
                </div>
            </section>

            <section class="py-4 flex align-items-center justify-content-between border-bottom-1 surface-border">
                <span :class="['text-xl font-semibold']">Dark Mode</span>
                <InputSwitch :modelValue="layoutConfig.darkTheme.value" @update:modelValue="onDarkModeChange" />
            </section>

            <template v-if="!simple">
                <section class="py-4 flex align-items-center justify-content-between border-bottom-1 surface-border">
                    <span class="text-xl font-semibold">Menu Type</span>
                    <SelectButton :modelValue="layoutConfig.menuMode.value" @update:modelValue="onMenuModeChange" :options="menuModes" optionLabel="label" optionValue="value" :allowEmpty="false" />
                </section>

                <section class="py-4 flex align-items-center justify-content-between border-bottom-1 surface-border">
                    <span class="text-xl font-semibold">Input Variant</span>
                    <SelectButton :modelValue="inputStyle" @update:modelValue="onInputStyleChange" :options="inputStyles" optionLabel="label" optionValue="value" :allowEmpty="false" />
                </section>
            </template>

            <section class="py-4 flex align-items-center justify-content-between border-bottom-1 surface-border">
                <span class="text-xl font-semibold">Ripple Effect</span>
                <InputSwitch :modelValue="layoutConfig.ripple.value" @update:modelValue="onRippleChange" />
            </section>

            <section class="py-4 border-bottom-1 surface-border">
                <div class="text-xl font-semibold mb-3">Themes</div>
                <div class="flex align-items-center gap-2 mb-3">
                    <img src="https://primefaces.org/cdn/primevue/images/themes/aura.png" alt="Aura" style="width: 1.5rem" />
                    <span class="font-medium">Aura</span>
                </div>
                <div class="flex align-items-center justify-content-between gap-3 mb-3">
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'green'), 'hover:border-500 surface-border': !isThemeActive('aura', 'green') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'green')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #4dac9c 0%, rgba(77, 172, 156, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'cyan'), 'hover:border-500 surface-border': !isThemeActive('aura', 'cyan') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'cyan')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #06b6d4 0%, rgba(6, 182, 212, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'blue'), 'hover:border-500 surface-border': !isThemeActive('aura', 'blue') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'blue')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #4378e6 0%, rgba(67, 120, 230, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'indigo'), 'hover:border-500 surface-border': !isThemeActive('aura', 'indigo') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'indigo')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #585fe0 0%, rgba(88, 95, 224, 0.5) 100%)"></span>
                    </button>
                </div>
                <div class="flex align-items-center justify-content-between gap-3 mb-3">
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'purple'), 'hover:border-500 surface-border': !isThemeActive('aura', 'purple') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'purple')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #7758e4 0%, rgba(119, 88, 228, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'amber'), 'hover:border-500 surface-border': !isThemeActive('aura', 'amber') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'amber')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #f59e0b 0%, rgba(245, 158, 11, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'teal'), 'hover:border-500 surface-border': !isThemeActive('aura', 'teal') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'teal')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #14b8a6 0%, rgba(20, 184, 166, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'pink'), 'hover:border-500 surface-border': !isThemeActive('aura', 'pink') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'pink')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #ec4899 0%, rgba(236, 72, 153, 0.5) 100%)"></span>
                    </button>
                </div>
                <div class="flex align-items-center justify-content-between gap-3">
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'noir'), 'hover:border-500 surface-border': !isThemeActive('aura', 'noir') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'noir')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #0f172a 0%, rgba(0, 0, 0, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('aura', 'lime'), 'hover:border-500 surface-border': !isThemeActive('aura', 'lime') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('aura', 'lime')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #84cc16 0%, rgb(132, 204, 22, 0.5) 100%)"></span>
                    </button>
                    <span class="w-3"></span>
                    <span class="w-3"></span>
                </div>

                <section class="pt-4 flex align-items-center justify-content-between">
                    <span class="text-sm">Primary Focus Ring</span>
                    <InputSwitch :modelValue="primaryFocusRing" @update:modelValue="onFocusRingColorChange" />
                </section>
            </section>

            <section class="py-4 border-bottom-1 surface-border">
                <div class="flex align-items-center gap-2 mb-3">
                    <img src="https://primefaces.org/cdn/primevue/images/themes/lara-light-teal.png" alt="Lara Light Teal" class="border-circle" style="width: 1.5rem" />
                    <span class="font-medium">Lara</span>
                </div>
                <div class="flex align-items-center justify-content-between gap-3 mb-3">
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'green'), 'hover:border-500 surface-border': !isThemeActive('lara', 'green') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'green')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #4dac9c 0%, rgba(77, 172, 156, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'cyan'), 'hover:border-500 surface-border': !isThemeActive('lara', 'cyan') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'cyan')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #06b6d4 0%, rgba(6, 182, 212, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'blue'), 'hover:border-500 surface-border': !isThemeActive('lara', 'blue') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'blue')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #4378e6 0%, rgba(67, 120, 230, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'indigo'), 'hover:border-500 surface-border': !isThemeActive('lara', 'indigo') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'indigo')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #585fe0 0%, rgba(88, 95, 224, 0.5) 100%)"></span>
                    </button>
                </div>
                <div class="flex align-items-center justify-content-between gap-3">
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'purple'), 'hover:border-500 surface-border': !isThemeActive('lara', 'purple') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'purple')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #7758e4 0%, rgba(119, 88, 228, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'amber'), 'hover:border-500 surface-border': !isThemeActive('lara', 'amber') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'amber')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #f59e0b 0%, rgba(245, 158, 11, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'teal'), 'hover:border-500 surface-border': !isThemeActive('lara', 'teal') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'teal')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #14b8a6 0%, rgba(20, 184, 166, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('lara', 'pink'), 'hover:border-500 surface-border': !isThemeActive('lara', 'pink') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('lara', 'pink')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #ec4899 0%, rgba(236, 72, 153, 0.5) 100%)"></span>
                    </button>
                </div>
            </section>

            <section class="py-4 border-bottom-1 surface-border">
                <div class="flex align-items-center gap-2 mb-3">
                    <img src="https://primefaces.org/cdn/primevue/images/themes/md-light-indigo.svg" alt="Material Design" class="border-circle" style="width: 1.5rem" />
                    <span class="font-medium">Material Design</span>
                    <div class="ml-auto flex align-items-center gap-2">
                        <label for="material-condensed" class="text-sm">Condensed</label>
                        <InputSwitch inputId="material-condensed" :modelValue="compactMaterial" @update:modelValue="onCompactMaterialChange" class="ml-auto" />
                    </div>
                </div>
                <div class="flex align-items-center justify-content-between gap-3">
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('md', 'indigo'), 'hover:border-500 surface-border': !isThemeActive('md', 'indigo') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('md', 'indigo')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #0565f2 0%, rgba(5, 101, 242, 0.5) 100%)"></span>
                    </button>
                    <button
                        :class="[
                            'bg-transparent border-1 cursor-pointer p-2 w-3 flex align-items-center justify-content-center transition-all transition-duration-200',
                            { 'border-primary': isThemeActive('md', 'deeppurple'), 'hover:border-500 surface-border': !isThemeActive('md', 'deeppurple') }
                        ]"
                        style="border-radius: 30px"
                        @click="changeTheme('md', 'deeppurple')"
                    >
                        <span class="block h-1rem w-full" style="border-radius: 30px; background: linear-gradient(180deg, #702f92 0%, rgba(112, 47, 146, 0.5) 100%)"></span>
                    </button>
                    <div class="w-3"></div>
                    <div class="w-3"></div>
                </div>
            </section>
        </div>
    </Sidebar>
    <Dialog v-model:visible="bellDialog" :style="{ width: '850px' }" header="Görevler" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <DataTable dataKey="id" :value="tasks" stripedRows paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" class="dialogDataTable" >
                <Column field="taskId" header="Id" style="width: 0%"></Column>
                <Column field="taskProjectId" header="Şirket Adı" style="width: 25%">
                    <template #body="slotProps"> 
                        <span v-if="slotProps.data.taskProjectId">
                            {{getProjectName(slotProps.data.taskProjectId)}}
                        </span>
                    </template>
                </Column>
                <Column field="taskName" header="Görev Adı" style="25%"></Column>
                <Column field="taskDescription" header="Açıklama" style="25%">
                    <template #body="slotProps">
                            <span v-if="slotProps.data.taskDescription" v-tooltip.top="slotProps.data.taskDescription"> {{ slotProps.data.taskDescription.slice(0, 20) }}{{ slotProps.data.taskDescription.length > 20 ? '...' : '' }} </span>
                        </template>
                </Column>
                <Column field="taskIsCompleted" header="Tamamlanma Durumu" style="width: 25%">
                        <template #body="{ data }">
                            <InputSwitch v-model="data.taskIsCompleted" @change="updateTaskStat(data)"/>
                        </template>
                    </Column>
            </DataTable>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-check" text @click="bellDialog=false" />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped>
.dialogDataTable{
    width: 100%;
    justify-content: center;
    align-items: center;
}  
</style>
