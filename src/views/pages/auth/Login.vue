<script >
import { authenticate } from '../../../service/fetch/authenticationsApi';

export default {
    data(){
        return {
            username:'',
            password:''
        }
    },
    methods:{
        async authentication(){
            const user = {
                username: this.username,
                password:this.password
            }
            try {
                const data = await authenticate(user);
                if(data){
                    this.$router.push('/home');
                } else{
                    this.$router.push('/auth/access');
                } 
            }
            catch (error) {
                if (error.message.includes('Unauthorized')) {
                    console.log('Unauthorized error occurred');
                } else {
                    console.error('An error occurred during authentication:', error.message);
                }
            }
            this.clear();
        },
        clear(){
            this.username='',
            this.password=''
        }
    }
}

</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Hoş Geldiniz!</div>
                    </div>
                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Kullanıcı Adı</label>
                        <InputText id="username" type="text" placeholder="Kullanıcı Adı" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="username" @keyup.enter="authentication" />

                        <label for="password" class="block text-900 font-medium text-xl mb-2">Şifre</label>
                        <Password id="password" v-model="password" placeholder="Şifre" :toggleMask="true" class="w-full mb-3" @keyup.enter="authentication" inputClass="w-full" :inputStyle="{ padding: '1rem' } "></Password>

                       
                        <Button label="Giriş Yap" class="w-full p-3 text-xl"  @click.prevent="authentication"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
