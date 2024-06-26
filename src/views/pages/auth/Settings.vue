<template>
    <div class="surface-ground flex align-items-center justify-content-center  overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="content">
                            <Toast />
                            <div>
                                <h4>
                                    {{ user.firstName }} {{user.lastName}}
                                </h4>
                            </div>
                            <div>
                                <InputText id="username" v-model="user.userName" disabled placeholder="Kullanıcı Adı" class="input" />
                            </div>
                            <div>
                                <InputText id="firstName" v-model="user.firstName" placeholder="Ad" class="input" />
                            </div>
                            <div>
                                <InputText id="lastName" v-model="user.lastName" placeholder="Soy Ad" class="input" />
                            </div>
                            <div>
                                <InputText id="password" v-model="password" placeholder="Şifre" class="input" />
                            </div>
                            <div>
                                <InputText id="confirmPassword" v-model="confirmPassword" placeholder="Yeniden Şifre" class="input" />
                            </div>
                             <div class="error-message">
                                <div v-for="(error, index) in errors" :key="index">
                                    {{ error }}
                                </div>
                            </div>
                            <div>
                                <Button label="Kaydet" icon="pi pi-check" aria-label="Submit" class="settingButton" @click.prevent="handleClick" />
                            </div>
                            <div class="description">
                                <p>Kullanıcı Adı değişikliği için yöneticiyle iletişime geçin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { updateUserForSettings, getOneUserByNameForSettings } from '../../../service/fetch/usersApi';
export default {
    data() {
        return {
            user: {
                id:'',
                firstName: '',
                lastName: '',
                userName: '',
            },
            password:'',
            confirmPassword:'',
            errors:[]
        };
    },
    methods: {
        async getOneUserByNameForSettings(){
            const userNameObject = {
                userName:this.userName
            }
            try {
                const userData = await getOneUserByNameForSettings(userNameObject);
                this.user=userData;
            } catch (error) {
                console.error('Error fetching user by username:', error.message);
                this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Kullanıcı getirilirken bir hata oluştu', life: 4000 });
            }
        },
        async updateUserForSettings(){
            this.errors=[];
            const normalizedUsername = this.user.userName.replace(/\s+/g, ' ').trim();
            const normalizedFirstName = this.user.firstName.replace(/\s+/g, ' ').trim();
            const normalizedLastName = this.user.lastName.replace(/\s+/g, ' ').trim();
            const normalizedPassword = this.password.replace(/\s+/g, ' ').trim();
            const normalizedConfirmPassword = this.confirmPassword.replace(/\s+/g, ' ').trim();
            if(!normalizedUsername){
                this.errors.push("Kullanıcı Adı Boş Geçilemez");
            } else if (!normalizedFirstName) {
                this.errors.push("Adı Boş Geçilemez");
            } else if(!normalizedLastName) {
                this.errors.push("Soy Adı Boş Geçilemez");
            }else if (!normalizedPassword) {
                this.errors.push("Şifre Boş Geçilemez");
            } else if(!/\d/.test(normalizedPassword)) {
                    this.errors.push("Şifre en az bir rakam içermelidir");
            } else if(normalizedPassword.length < 6) {
                    this.errors.push("Şifre en az 6 karakter içermelidir")
            } else if (!normalizedConfirmPassword) {
                this.errors.push("Şifre Tekrarı Boş Geçilemez");
            } else {
                try {
                    const updatedUser = {
                        id:this.user.id,
                        username:normalizedUsername,
                        firstName:normalizedFirstName,
                        lastName:normalizedLastName,
                        password:normalizedPassword,
                    }
                    const response = await updateUserForSettings(updatedUser.id, updatedUser);
                    if(response === 204){
                        await this.getOneUserByNameForSettings();
                        this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Güncellene Başarılı', life: 4000 });
                    }
                } catch (error) {
                    console.error('Error updating user', error);
                    this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update user', life: 3000});
                }
            }
        },
        handleClick() {
            if (this.confirmPassword === this.password) {
                this.updateUserForSettings();
            } else {
                this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Şifreler uyuşmuyor..', life: 4000 });
            }
        },
    },
    async mounted() {
        const toast = useToast();
        const router = useRouter();
        this.userName = localStorage.getItem('userName');
        if (!this.userName) {
            router.push('/auth/login');
        } else {
            await this.getOneUserByNameForSettings();
        }
        
    }
};
</script>

<style>
.content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.input {
    margin-top: 20px;
}

.error-message {
    margin-top: 10px;
    align-content: center;
    justify-content:  center;
    text-align: center;
    color: #ff6347;
    font-size: 14px;
    margin-bottom: 5px;
}

.settingButton {
    width: 100px;
    margin-top: 20px;
}

.description{
    margin-top: 20px;
}
</style>