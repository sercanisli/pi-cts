<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Kullanıcı" icon="pi pi-plus" class="mr-2" @click="openNew"/>
                        </div>
                    </template>
                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                    </template>
                </Toolbar>
                <DataTable
                    data-key="id" 
                    :value="filteredUsers" 
                    :globalFilter="globalFilter"
                    stripedRows  
                    paginator 
                    :rows="10" 
                    :rowsPerPageOptions="[5, 10, 20, 50]" 
                    tableStyle="min-width: 50rem"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Kullanıcılar</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="globalFilter" class="w-full sm:w-auto"/>
                            </IconField>
                        </div>
                    </template>
                    <Column field="id"  header="" style="width: 0%"></Column>
                    <Column field="userName" header="Kullanıcı Adı" style="width: 30%"></Column>
                    <Column field="firstName" header="Adı" style="width: 20%"></Column>
                    <Column field="lastName" header="Soy Adı" style="width: 20%"></Column>
                    <Column style="width: 15%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editUser(slotProps.data)" />
                            <Button icon="pi pi-shield" class="mr-2" severity="info" rounded @click="accessUser(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteUser(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>    
                <Dialog
                    v-model:visible="userDialog" 
                    :style="{ width: '400px' }" 
                    header="Yeni Kullanıcı" 
                    :modal="true" class="p-fluid"
                >
                    <div class="dialog-group">
                        <InputText id="userName"  v-model="userName" placeholder="Kullanıcı Adı" class="input" />
                        <InputText id="firstName"  v-model="firstName" placeholder="Adı" class="input" />
                        <InputText id="lastName"  v-model="lastName" placeholder="Soyadı" class="input" />
                        <InputText id="password"  v-model="password" placeholder="Şifre" class="input" />
                        <InputText id="confirmPassword"  v-model="confirmPassword" placeholder="Şifre Tekrarı" class="input" />
                         <div class="error-message">
                            <div v-for="(error, index) in errors" :key="index">
                                {{ error }}
                            </div>
                        </div>
                        <div class="button-group">
                            <Button label="Cancel" icon="pi pi-times" text="" class="button" @click.prevent="cancelClick" />
                            <Button label="Save" icon="pi pi-check" text=""  class="button" @click.prevent="saveClick"/>
                        </div>
                    </div>
                </Dialog>
                <Dialog 
                    v-model:visible="deleteUserDialog" 
                    :style="{ width: '450px' }"
                    header="Confirm" 
                    :modal="true"
                >
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedUser"
                            >Are you sure you want to delete <b>{{ selectedUser.userName }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteUserDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteUser" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>


<script>
import { getAllUsers, createOneUser, updateUser, deleteUser } from '../../../service/fetch/usersApi';

import { useToast } from 'primevue/usetoast';
export default {
   
    data(){
        return{
            id:'',
            users:[],
            visible:false,
            selectedUser:null,
            userDialog:false,
            userName:'',
            firstName:'',
            lastName:'',
            password:'',
            confirmPassword:'',
            deleteUserDialog:false,
            globalFilter:'',
            errors:[]
        }
    },
    methods: {
        getAllUsers(){
            getAllUsers(this.id)
            .then(data => {
                this.users = data
            })
            .catch(error=>{
                console.error('Error fetching users', error);
            })
        },
        openNew(){
            this.clearUserDialog();
            this.userDialog=true;
        },
        cancelClick(){
            this.userDialog=false;
        },
        async saveClick(){
            const normalizedUsername = this.userName.replace(/\s+/g, ' ').trim();
            const normalizedFirstName = this.firstName.replace(/\s+/g, ' ').trim();
            const normalizedLastName = this.lastName.replace(/\s+/g, ' ').trim();
            const normalizedPassword = this.password.replace(/\s+/g, ' ').trim();
            const normalizedConfirmPassword = this.confirmPassword.replace(/\s+/g, ' ').trim();
            this.errors = [];
            if(!this.userName.trim()){
                this.errors.push("Kullanıcı Adı Boş Geçilemez");
            } else if (!this.firstName.trim()) {
                this.errors.push("Adı Boş Geçilemez");
            } else if (!this.password.trim()) {
                this.errors.push("Şifre Boş Geçilemez");
            } else if(!/\d/.test(normalizedPassword)) {
                    this.errors.push("Şifre en az bir rakam içermelidir");
            } else if(normalizedPassword.length < 6) {
                    this.errors.push("Şifre en az 6 karakter içermelidir")
            } else if (!this.confirmPassword.trim()) {
                this.errors.push("Şifre Tekrarı Boş Geçilemez");
            } else {
                if(!this.id){
                    if(normalizedPassword === normalizedConfirmPassword)
                    {
                        if(!this.users.find(user=>user.userName === normalizedUsername)){
                            const newUser = {
                                firstName:normalizedFirstName,
                                lastName : normalizedLastName,
                                userName:normalizedUsername,
                                password:normalizedPassword,
                                roles:[
                                    "Bağlantilari Gorme"
                                ]
                            }
                            const response = await createOneUser(newUser);
                            if(response.ok){
                                this.$toast.add({severity: 'success', summary:'Successful', detail:'User Added', life:3000});
                                this.getAllUsers();
                            } else {
                                this.$toast.add({severity: 'error', summary:'Error', detail:'User not Added', life:3000});
                            }
                        } else {
                            this.$toast.add({severity: 'error', summary:'Error', detail:'username must be unique', life:3000});
                        }
                    } else {
                        this.$toast.add({severity: 'error', summary:'Error', detail:'password and confirm password not match', life:3000});
                    }
                } else {
                    this.updateUser(normalizedUsername, normalizedFirstName, normalizedLastName, normalizedPassword);
                }
                this.clearUserDialog();
                this.cancelClick();
            }
        },
        clearUserDialog(){
            this.id='',
            this.selectedRole='';
            this.userName='',
            this.fullname='',
            this.password='',
            this.confirmPassword=''
        },
        editUser(editUser){
            this.id=editUser.id;
            this.userName = editUser.userName;
            this.firstName = editUser.firstName;
            this.lastName = editUser.lastName;
            this.userDialog=true;
        },
        async updateUser(normalizedUsername, normalizedFirstName, normalizedLastName, normalizedPassword) {
            const userId = this.id
            try {
                const newUser = {
                    id:userId,
                    firstName:normalizedFirstName,
                    lastName:normalizedLastName,
                    userName:normalizedUsername,
                    password:normalizedPassword,
                }
                const response = await updateUser(userId, newUser);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000});
                    this.getAllUsers();
                } else {
                    this.$toast.add({severity: 'error', summary: 'Error', detail: 'User not Updated', life: 3000});
                }
            } catch (error) {
                console.error('Error updating user:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update user', life: 3000});
            }
            this.clearUserDialog();
            this.cancelClick();
        },
        accessUser(user){
            this.$router.push({ name: 'access', params: { userId: user.id } });
        },
        confirmDeleteUser(editUser){
            this.selectedUser = editUser
            this.deleteUserDialog=true;
        },
        async deleteUser(){
            const response = await deleteUser(this.selectedUser.id);
            if(!response === 204){
                this.$toast.add({severity: 'error', summary:'Error', detail:'User not Deleted', life:3000});
            } else {
                this.deleteUserDialog = false;
                this.selectedUser = null; 
                this.getAllUsers();
                this.$toast.add({severity: 'success', summary:'Successful', detail:'User Deleted', life:3000});
            }
        }
    },
    mounted(){
        const toast = useToast();
    },
    created() {
        this.getAllUsers()
    },
    computed: {
        filteredUsers() {
            return this.users.filter(user => user.firstName.toLowerCase().includes(this.globalFilter.toLowerCase()));
        }
    }
}

</script>

<style scoped>

.dropdown{
    width: 100% !important;
}

.input{
    margin-top: 30px;
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

.button-group{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
}

.button{
    width: 30%;
}

</style>
