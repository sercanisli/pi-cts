import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import auth from './auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true, permissions:'Dashboard Gorme' }
                },
                {
                    path: '/pages/timeline',
                    name: 'timeline',
                    component: () => import('@/views/pages/Timeline.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    component: () => import('@/views/pages/Crud.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/system/user',
                    name: 'user',
                    component: () => import('@/views/pages/system/User.vue'),
                    meta: { requiresAuth: true, permissions:'Kullanicilari Gorme' }
                },
                {
                    path: '/system/user/access/:userId',
                    name: 'access',
                    component: () => import('@/views/pages/system/UserAccess.vue'),
                    meta: { requiresAuth: true, permissions:'Kullanicilari Gorme' }
                },
                {
                    path: '/system/company',
                    name: 'company',
                    component: () => import('@/views/pages/system/Company.vue'),
                    meta: { requiresAuth: true, permissions:'Firmalari Gorme'}
                },
                {
                    path: '/system/branch',
                    name: 'branch',
                    component: () => import('@/views/pages/system/Branch.vue'),
                    meta: { requiresAuth: true, permissions:'Şubeleri Gorme' }
                },
                {
                    path: '/system/person',
                    name: 'person',
                    component: () => import('@/views/pages/system/Person.vue'),
                    meta: { requiresAuth: true, permissions:'Yetkili Kişileri Gorme' }
                },
                {
                    path: '/system/connection',
                    name: 'connection',
                    component: () => import('@/views/pages/system/Connection.vue'),
                    meta: { requiresAuth: true, permissions:'Bağlantilari Gorme'}
                },
                {
                    path: '/system/connection-type',
                    name: 'connectionType',
                    component: () => import('@/views/pages/system/ConnectionType.vue'),
                    meta: { requiresAuth: true, permissions:'Bağlanti Tipi Gorme' }
                },
                {
                    path: '/home',
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
                    path: '/:catchAll(.*)',
                    name: 'notfound',
                    component: () => import('@/views/pages/NotFound.vue')
                },
                {
                    path: '/auth/settings',
                    name: 'settings',
                    component: () => import('@/views/pages/auth/Settings.vue'),
                    meta: { requiresAuth: true}
                }
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue'),
            meta: { requiresAuth: true }
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
    if (to.matched.some(record => record.meta.requiresAuth) && !auth.isAuthenticated()) {
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
})

export default router;
