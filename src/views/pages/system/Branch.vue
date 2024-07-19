<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Şube" icon="pi pi-plus" class="mr-2" @click="openNew"/>
                        </div>
                    </template>
                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                    </template>
                </Toolbar>
                <DataTable
                    data-key="id" 
                    :value="filteredBranches" 
                    :globalFilter="globalFilter"
                    stripedRows  
                    paginator 
                    :rows="10" 
                    :rowsPerPageOptions="[5, 10, 20, 50]" 
                    tableStyle="min-width: 50rem"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Şubeler</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="globalFilter" class="w-full sm:w-auto" placeholder="Şirket ya da Şube adı"/>
                            </IconField>
                        </div>
                    </template>
                    <Column field="id" header="Id" style="width: 5%"></Column>
                    <Column field="companyId" header="Şirket Adı" style="width: 15%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.companyId">
                                {{ getCompanyName(slotProps.data.companyId) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="branchName" header="Şube Adı" style="width: 15%"></Column>
                    <Column field="description" header="Açıklama" style="width: 50%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.description" v-tooltip.top="slotProps.data.description ">
                                {{ slotProps.data.description.slice(0, 70) }}{{ slotProps.data.description.length > 70 ? '...' : '' }}
                            </span>
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editBranch(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteBranch(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <Dialog
                    v-model:visible="branchDialog" 
                    :style="{ width: '400px' }" 
                    header="Yeni Şube" 
                    :modal="true" class="p-fluid"
                >
                    <div class="dialog-group">
                        <Dropdown 
                            v-model="selectedCompany"
                            :options="companies"
                            optionLabel="companyName"
                            :placeholder="'Şirket Seçiniz'"
                            class="w-full md:w-14rem dropdown"
                        />
                        <InputText id="branchName"  v-model="branchName" placeholder="Şube Adı" class="input"/>
                        <Textarea id="description" v-model="description" placeholder="Açıklama" :autoResize="true" rows="7" cols="30" class="textarea" />
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
                    v-model:visible="deleteBranchDialog" 
                    :style="{ width: '450px' }"
                    header="Confirm" 
                    :modal="true"
                >
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedCompany && selectedBranch"
                            >Are you sure you want to delete <b>{{ selectedCompany }} - {{ selectedBranch.branchName }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteBranchDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteBranch" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>    
</template>



<script>
import { useToast } from 'primevue/usetoast';
import { getAllLimitedCompanies} from '../../../service/fetch/comapniesApi';
import { getAllBranches, createBranch, updateBranch, deleteBranch} from '../../../service/fetch/branchesApi';

export default {
    data(){
        return {
            id:'',
            companies:[],
            branches:[],
            branch:'',
            selectedCompany:null,
            selectedBranch:null,
            companyId:'',
            branchName:'',
            description:'',
            visible:false,
            globalFilter:'',
            branchDialog:false,
            deleteBranchDialog:false,
            errors:[]
        }
    },
    methods:{
        getAllBranches() {
            getAllBranches()
            .then(data => {
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
            this.errors = [];
            this.clearBranchDialog();
            this.branchDialog = true;
        },
        cancelClick(){
            this.branchDialog=false;
        },
        async saveClick(){
            const normalizedBranchName = this.branchName.replace(/\s+/g, ' ').trim();
            this.errors = [];
            if(!this.selectedCompany) {
                this.errors.push("Lütfen bir şirket seçiniz");
            } else if(!this.branchName.trim()){
                this.errors.push("Şube adı boş geçilemez");
            } else {
                if(!this.id){
                    const companyId = this.selectedCompany.id;
                    if(!this.branches.find(branch=>branch.companyId ==this.selectedCompany.id && branch.branchName === normalizedBranchName)){
                        const newBranch = {
                        companyId:companyId,
                        branchName:normalizedBranchName,
                        description:this.description
                    }
                    const createdBranch = await createBranch(newBranch);
                    this.branches.push(createdBranch);
                    this.$toast.add({severity: 'success', summary:'Successful', detail:'Branch Added', life:3000});
                    } else {
                    this.$toast.add({severity: 'error', summary:'Error', detail:'Branch can be unique', life:3000});
                    }
                } else {
                    this.updateBranch(normalizedBranchName);
                }
                this.clearBranchDialog();
                this.cancelClick();
                this.getAllLimitedCompanies();
                this.getAllBranches();
            }
            
        },
        clearBranchDialog(){
            this.id='';
            this.companyId='';
            this.branchName='';
            this.description='';
            this.selectedCompany='';
        },
        editBranch(editBranch){
            const companyName = this.getCompanyName(editBranch.companyId);
            this.id=editBranch.id;
            this.selectedCompany = this.companies.find(c=> c.companyName === companyName);
            this.branchName= editBranch.branchName;
            this.description = editBranch.description;
            this.branchDialog = true;
        },
        async updateBranch(normalizedBranchName){
            const companyId = this.selectedCompany.id;
            try {
                const updatedBranch = {
                    id: this.id,
                    companyId:companyId,
                    branchName:normalizedBranchName,
                    description:this.description
            }
            const response = await updateBranch(this.id, updatedBranch);
            if(response === 204){
                this.$toast.add({severity: 'success', summary: 'Successful', detail: 'Branch Updated', life: 3000});
                this.getAllBranches();
                this.getAllLimitedCompanies();
            } else {
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Branch not Updated', life: 3000});
            }
            this.clearBranchDialog();
            this.cancelClick();
            } catch (error) {
                console.error('Error updating branch:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update branch', life: 3000});
            }
        },
        confirmDeleteBranch(deleteBranch){
            const companyName = this.getCompanyName(deleteBranch.companyId);
            this.selectedBranch = deleteBranch;
            this.selectedCompany = companyName;
            this.deleteBranchDialog = true;
        },
        async deleteBranch(){
            const deletedBranchId = this.selectedBranch.id;
            try {
                const response = await deleteBranch(deletedBranchId);
                if(response === 204) {
                    this.$toast.add({severity: 'success', summary:'Successful', detail:'Branch Deleted', life:3000});
                    this.getAllBranches();
                    this.getAllLimitedCompanies();
                } else {
                    this.$toast.add({severity: 'error', summary:'Eroor', detail:'Branch not Deleted', life:3000});
                }

                this.deleteBranchDialog = false;
                this.selectedBranch = null;
            } catch (error) {
                console.error('Error deleting branch:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to delete branch', life: 3000});
            }
            this.deleteBranchDialog = false;
        },
        getCompanyName(companyId){
            const company = this.companies.find(company=> company.id === companyId);
            return company ?
                company.companyName :
                '';
        },
        getCompanyId(companyName){
            const company = this.companies.find(company => company.companyName === companyName );
            return company ? 
                company.id :
                '';
        }
    },
    mounted(){
        const toast = useToast();
        
        this.getAllBranches();
        this.getAllLimitedCompanies();
    },
    computed:{
        filteredBranches() {
            return this.branches.filter((branch) => {
                const companyName = this.getCompanyName(branch.companyId);
                return companyName.toLowerCase().includes(this.globalFilter.toLowerCase()) || branch.branchName.toLowerCase().includes(this.globalFilter.toLowerCase());
            })
        }
    }
}
</script>


<style>
.dropdown{
    width: 100% !important;
}

.input{
    margin-top: 30px;
}

.textarea{
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