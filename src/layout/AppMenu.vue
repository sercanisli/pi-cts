    <script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

    const model = ref([
        {
            label: 'Dashboard',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
        },
        {
            label:'İşlemler',
            icon:'',
            items:[
                {
                    label:'Bağlantılar',
                    icon:'pi pi-link',
                    to:'/'
                }
            ]
        },
        {
            label: 'Sistem Tanımlamaları',
            icon: 'pi pi-fw pi-home',
            items: [
                {
                    label: 'Kullanıcı Tanımlamaları', 
                    icon: 'pi pi-user-edit', 
                    to: '/system/user'
                },
                {
                    label: 'Firma Tanımlamaları', 
                    icon: 'pi pi-building', 
                    to: '/system/company'
                },
                {
                    label: 'Şube Tanımlamaları',
                    icon: 'pi pi-sitemap',
                    to:'/system/branch'
                },
                {
                    label:'Yetkili Kişi Tanımlamaları',
                    icon:'pi pi-users',
                    to:'/system/person'
                },
                {
                    label: 'Bağlantı Tanımlamaları', 
                    icon: 'pi pi-link', 
                    to: '/system/connection'
                },
                {
                    label: 'Bağlantı Tipi Tanımlamaları', 
                    icon: 'pi pi-desktop', 
                    to: '/system/connection-type'
                },
                {
                    label: 'Proje Tanımlamaları', 
                    icon: 'pi pi-directions', 
                    to: '/system/project'
                },

            ]
        }
    ]);
    </script>

    <template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <li>
            <a href="https://www.primefaces.org/primeblocks-vue/#/" target="_blank"> </a>
        </li>
    </ul>
</template>

    <style lang="scss" scoped>
</style>
