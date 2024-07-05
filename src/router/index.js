import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import auth from './auth';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true, permissions: 'Dashboard Gorme' }
                },
                {
                    path: '/system/user',
                    name: 'user',
                    component: () => import('@/views/pages/system/User.vue'),
                    meta: { requiresAuth: true, permissions: 'Kullanicilari Gorme' }
                },
                {
                    path: '/system/user/access/:userId',
                    name: 'access',
                    component: () => import('@/views/pages/system/UserAccess.vue'),
                    meta: { requiresAuth: true, permissions: 'Kullanicilari Gorme' }
                },
                {
                    path: '/system/company',
                    name: 'company',
                    component: () => import('@/views/pages/system/Company.vue'),
                    meta: { requiresAuth: true, permissions: 'Firmalari Gorme' }
                },
                {
                    path: '/system/branch',
                    name: 'branch',
                    component: () => import('@/views/pages/system/Branch.vue'),
                    meta: { requiresAuth: true, permissions: 'Şubeleri Gorme' }
                },
                {
                    path: '/system/person',
                    name: 'person',
                    component: () => import('@/views/pages/system/Person.vue'),
                    meta: { requiresAuth: true, permissions: 'Yetkili Kişileri Gorme' }
                },
                {
                    path: '/system/connection',
                    name: 'connection',
                    component: () => import('@/views/pages/system/Connection.vue'),
                    meta: { requiresAuth: true, permissions: 'Bağlantilari Gorme' }
                },
                {
                    path: '/system/connection-type',
                    name: 'connectionType',
                    component: () => import('@/views/pages/system/ConnectionType.vue'),
                    meta: { requiresAuth: true, permissions: 'Bağlanti Tipi Gorme' }
                },
                {
                    path: '/',
                    name: 'home',
                    component: () => import('@/views/pages/Home.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/auth/access',
                    name: 'accessDenied',
                    component: () => import('@/views/pages/auth/Access.vue')
                },
                {
                    path: '/auth/settings',
                    name: 'settings',
                    component: () => import('@/views/pages/auth/Settings.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/system/project',
                    name: 'project',
                    component: () => import('@/views/pages/system/Project.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/system/project/tasks/:projectId',
                    name: 'tasks',
                    component: () => import('@/views/pages/system/Gantt.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/pages/notfound',
                    name: 'notfound',
                    component: () => import('@/views/pages/NotFound.vue')
                },
                {
                    path: '/:catchAll(.*)',
                    redirect: { name: 'notfound' }
                }
            ]
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },
    ]
});
router.beforeEach((to, from, next) => {
    const accessToken = auth.isAuthenticated();
    if (to.matched.some(record => record.meta.requiresAuth) && !accessToken) {
        next({ name: 'login' });
    } else {
        if (to.meta.permissions) {
            const userPermissions = auth.isUserHavePermission();
            const requiredPermissions = Array.isArray(to.meta.permissions) ? to.meta.permissions : [to.meta.permissions];
            if (requiredPermissions.some(permission => userPermissions.includes(permission))) {
                next();
            } else {
                next({ name: 'accessDenied' });
            }
        } else {
            next(); 
        }
    }
});

export default router;
