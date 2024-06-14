<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import logo from '../assets/logo/logo.png'

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return logo;
});
</script>

<template>
    <div class="layout-footer">
        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
        <span class="font-medium ml-2">Pi Otomasyon CTS</span>
    </div>
</template>
<style lang="scss" scoped></style>
