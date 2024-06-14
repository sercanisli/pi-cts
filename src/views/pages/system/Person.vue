<template>
    <div class="grid">
       <div class="col-12">
           <div class="card">
               <Toolbar class="mb-4">
                   <template v-slot:start>
                       <div class="my-2">
                           <Button label="Yeni Yetkili Kişi" icon="pi pi-plus" class="mr-2" @click="openNew"/>
                       </div>
                   </template>
                   <template v-slot:end>
                       <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                   </template>
               </Toolbar>
               <DataTable
                   data-key="id" 
                   :value="filteredPersons" 
                   :globalFilter="globalFilter"
                   stripedRows  
                   paginator 
                   :rows="10" 
                   :rowsPerPageOptions="[5, 10, 20, 50]" 
                   tableStyle="min-width: 50rem"
               >
                   <template #header>
                       <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                           <h5 class="m-0">Yetkili Kişiler</h5>
                           <IconField iconPosition="left" class="block mt-2 md:mt-0">
                               <InputIcon class="pi pi-search" />
                               <InputText v-model="globalFilter" class="w-full sm:w-auto"/>
                           </IconField>
                       </div>
                   </template>
                   <Column field="id" header="Id" style="width: 5%"></Column>
                   <Column field="fullName" header="Yetkili Kişi Adı" style="width: 20%"></Column>
                   <Column field="companyId" header="Şirket Adı" style="width: 20%">
                       <template #body="slotProps">
                           <span v-if="slotProps.data.branchId">
                               {{ getCompanyName(slotProps.data.branchId) }}
                           </span>
                       </template>
                   </Column>
                   <Column field="branchId" header="Şube Adı" style="width: 20%">
                       <template #body="slotProps">
                           <span v-if="slotProps.data.branchId">
                           {{ getBranchName(slotProps.data.branchId) }}
                           </span>
                       </template>
                   </Column>
                   <Column field="phone" header="Telefon Numarası" style="width: 20%"></Column>
                   <Column style="width: 15%">
                       <template #body="slotProps">
                           <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editPerson(slotProps.data)" />
                           <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeletePerson(slotProps.data)" />
                       </template>
                   </Column>
               </DataTable>
               <Dialog
                   v-model:visible="personDialog" 
                   :style="{ width: '400px' }" 
                   header="Yeni Yetkili Kişi" 
                   :modal="true" class="p-fluid"
               >
                   <div class="dialog-group">
                       <InputText id="fullName"  v-model="fullName" placeholder="Kullanıcı Tam Adı" class="input" />
                       <Dropdown 
                           v-model="selectedCompany"
                           :options="companies"
                           optionLabel="companyName"
                           :placeholder="'Şirket Seçiniz'"
                           class="w-full md:w-14rem dropdown"
                           @change="getBranchForDropdown"
                       />
                       <Dropdown 
                           v-model="selectedBranch"
                           :options="filteredBranches"
                           optionLabel="branchName"
                           :placeholder="'Şube Seçiniz'"
                           class="w-full md:w-14rem dropdown"
                       />
                       <InputText id="phone"  v-model="phone" placeholder="Telefon Numarası" class="input" />
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
                    v-model:visible="deletePersonDialog" 
                    :style="{ width: '450px' }"
                    header="Confirm" 
                    :modal="true"
                >
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedCompany && selectedBranch && selectedPerson"
                            >Are you sure you want to delete <b>{{ selectedPerson.fullName }} - {{ selectedCompany }} - {{ selectedBranch }} </b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deletePersonDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deletePerson" />
                    </template>
                </Dialog>
           </div>
       </div>
   </div>    
</template>


<script>
import { useToast } from 'primevue/usetoast';
import { getAllLimitedCompanies } from '../../../service/fetch/comapniesApi';
import { getAllLimitedBranches } from '../../../service/fetch/branchesApi';
import { getAllPersons, createPerson, updatePerson, deletePerson } from '../../../service/fetch/personsApi';

export default {
   data(){
       return{
           id:'',
           persons:[],
           companies:[],
           branches:[],
           person:'',
           selectedPerson:null,
           selectedCompany:null,
           selectedBranch:null,
           companyId:'',
           branchId:'',
           fullName:'',
           phone:'',
           visible:false,
           globalFilter:'',
           personDialog:false,
           deletePersonDialog:false,
           branchName:'',
           errors:[]
       }
   },
   methods:{
    getAllPersons(){
        getAllPersons()
        .then(data => {
            this.persons = data;
        })
        .catch(error => {
            console.error('Error fetching persons:', error)
        });
    },
    getAllLimitedBranches(){
        getAllLimitedBranches()
        .then(data=> {
            this.branches = data;
        })
        .catch(error => {
            console.error('Error fetching branches:', error)
        });
    },
    getAllLimitedCompanies(){
        getAllLimitedCompanies()
        .then(data => {
            this.companies = data;
        })
        .catch(error => {
            console.error('Error fetching companies:', error)
        });
    },
       openNew(){
            this.errors=[];
           this.clearPersonDialog();
           this.personDialog = true;
       },
       cancelClick(){
           this.personDialog = false;
       },
       async saveClick(){
            this.errors=[];
            const normalizedFullName = this.fullName.replace(/\s+/g, ' ').trim();
            const normalizedPhone = this.phone.replace(/\s+/g, ' ').trim();
            if(!this.fullName.trim()){
                this.errors.push("Kullanıcı Tam Adı Boş Geçilemez");
            } else if (!this.selectedCompany) {
                this.errors.push("Lütfen bir şirket seçiniz");
            } else if(!this.selectedBranch) {
                this.errors.push("Lütfen bir şube seçiniz");
            } else if (!this.phone.trim()) {
                this.errors.push("Telefon numarası boş geçilemez");
            } else {
                if(!this.id){
                    const branchId = this.selectedBranch.id;
                    if(!this.persons.find(person=>person.fullName === normalizedFullName && person.branchId === this.selectedBranch.id && person.phone === normalizedPhone)){
                        const newPerson = {
                            branchId:branchId,
                            fullName:normalizedFullName,
                            phone:normalizedPhone
                        }
                        const createdPerson = await createPerson(newPerson);
                        this.persons.push(createdPerson);
                        this.$toast.add({severity: 'success', summary:'Successful', detail:'Person Added', life:3000});
                    } else {
                        this.$toast.add({severity: 'error', summary:'Error', detail:'Person can be unique', life:3000});
                    }
                } else {
                    this.updatePerson(normalizedFullName, normalizedPhone);
                }
                this.getAllLimitedCompanies();
                this.getAllLimitedBranches();
                this.getAllPersons();
                this.clearPersonDialog();
                this.cancelClick();
            }
            
       },
       clearPersonDialog(){
            this.id='';
            this.branchId='';
            this.companyId='';
            this.fullName='';
            this.phone='';
            this.selectedCompany=null;
            this.selectedBranch=null;
       },
       editPerson(editPerson){
            this.id=editPerson.id;
            const companyName = this.getCompanyName(editPerson.branchId);
            const branchName = this.getBranchName(editPerson.branchId);
            this.selectedCompany = this.companies.find(company=>company.companyName === companyName);
            this.selectedBranch = this.branches.find(branch => branch.branchName === branchName);
            this.fullName = editPerson.fullName;
            this.phone = editPerson.phone;
            this.getBranchForDropdown();
            this.personDialog = true;
       },
       async updatePerson(normalizedFullName, normalizedPhone){
            const branchId = this.selectedBranch.id;
            try {
                const updatedPerson = {
                    id:this.id,
                    branchId:branchId,
                    fullName:normalizedFullName,
                    phone:normalizedPhone
                }
                const response = await updatePerson(this.id, updatedPerson);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary: 'Successful', detail: 'Person Updated', life: 3000});
                    this.getAllPersons();
                    this.getAllLimitedBranches();
                } else {
                    this.$toast.add({severity: 'error', summary: 'Error', detail: 'Person not Updated', life: 3000});
                }
                this.clearPersonDialog();
                this.cancelClick();
            } catch (error) {   
                console.error('Error updating person:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update person', life: 3000});
            }
       },
       confirmDeletePerson(deletePerson){
            const branchName = this.getBranchName(deletePerson.branchId);
            const companyName = this.getCompanyName(deletePerson.branchId);
            this.selectedPerson=deletePerson;
            this.selectedBranch=branchName;
            this.selectedCompany = companyName;
            this.deletePersonDialog = true;
       },
       async deletePerson(){
            const deletedPersonId = this.selectedPerson.id;
            try {
                const response = await deletePerson(deletedPersonId);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary:'Successful', detail:'Person Deleted', life:3000});
                    this.getAllPersons();
                    this.getAllLimitedBranches();
                } else {
                    this.$toast.add({severity: 'error', summary:'Eroor', detail:'Person not Deleted', life:3000});
                }
                this.deletePersonDialog = false;
                this.selectedPerson = null;
            } catch (error) {
                console.error('Error deleting person:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to delete person', life: 3000});
            }
            this.deletePersonDialog=false;
       },
       getBranchForDropdown(){
            const selectedCompanyId = this.selectedCompany.id;
            const filteredBranches = [];

            this.branches.forEach((branch) => {
                if (branch.companyId === selectedCompanyId) {
                    filteredBranches.push(branch);
                }
            });
            this.filteredBranches = filteredBranches;

       },   
       getBranch(branchId){
            return this.branches.find(branch=>branch.id === branchId);
       },
       getCompanyName(branchId){
            const branch = this.getBranch(branchId);
            if(!branch){
                return '';
            }

            const company = this.companies.find(company=>company.id === branch.companyId);
            return company ?
                company.companyName :
                '';
       },
       getBranchName(branchId){
           const branch = this.getBranch(branchId)
           return branch ?
               branch.branchName :
               '';
       },
       getCompanyId(companyName){
            const company = this.companies.find(company=>company.companyName === companyName);
            return company ? 
                company.id :
                '';
       },
       getBranchId(branchName){
            const branch = this.branches.find(branch=>branch.branchName === branchName);
            return branch ?
                branch.id :
                '';
       },
   },
   mounted(){
       const toast = useToast();

      
   },
   created(){
        this.getAllPersons();
       this.getAllLimitedBranches();
       this.getAllLimitedCompanies();
   },
   computed:{
       filteredPersons() {
           return this.persons.filter(person => person.fullName.toLowerCase().includes(this.globalFilter.toLowerCase()));
       }
   },
}
</script>


<style>
.dropdown{
   width: 100% !important;
   margin-top: 30px;
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