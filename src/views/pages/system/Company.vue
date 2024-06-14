<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Firma" icon="pi pi-plus" class="mr-2" @click="openNew" />
                        </div>
                    </template>
                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                    </template>
                </Toolbar>
                <DataTable data-key="id" :value="filteredCompanies" :globalFilter="globalFilter" stripedRows paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Şirketler</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="globalFilter" class="w-full sm:w-auto" />
                            </IconField>
                        </div>
                    </template>
                    <Column field="id" header="Id" style="width: 5%"></Column>
                    <Column field="companyName" header="Şirket Adı" style="width: 20%"></Column>
                    <Column field="description" header="Açıklama" style="width: 60%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.description" v-tooltip.top="slotProps.data.description"> {{ slotProps.data.description.slice(0, 70) }}{{ slotProps.data.description.length > 70 ? '...' : '' }} </span>
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editCompany(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteCompany(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <Dialog v-model:visible="companyDialog" :style="{ width: '400px' }" header="Yeni Şirket" :modal="true" class="p-fluid" @submit.prevent="saveClick()">
                    <div class="dialog-group">
                        <InputText id="companyName" v-model="companyName" placeholder="Şirket Adı" class="input" />

                        <Textarea id="description" v-model="description" placeholder="Açıklama" :autoResize="true" rows="7" cols="30" class="textarea" />
                        <div class="error-message">
                            <div v-for="(error, index) in errors" :key="index">
                                {{ error }}
                            </div>
                        </div>
                        <div class="button-group">
                            <Button label="Cancel" icon="pi pi-times" text="" class="button" @click.prevent="cancelClick" />
                            <Button label="Save" icon="pi pi-check" text="" class="button" @click.prevent="saveClick" />
                        </div>
                    </div>
                </Dialog>
                <Dialog v-model:visible="deleteCompanyDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedCompany"
                            >Are you sure you want to delete <b>{{ selectedCompany.companyName }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteCompanyDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteCompany" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>


<script>
import { useToast } from 'primevue/usetoast';
import { getAllBranchMainRoots } from '../../../service/fetch/branchMainRootsApi';
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from '../../../service/fetch/comapniesApi';
export default {
    data() {
        return {
            id: '',
            companies: [],
            mainRoots:[],
            company: '',
            visible: false,
            selectedCompany: null,
            companyDialog: false,
            companyName: '',
            description: '',
            deleteCompanyDialog: false,
            globalFilter: '',
            errors: []
        };
    },
    methods: {
        getAll() {
            getAllCompanies()
                .then((data) => {
                    this.companies = data;
                })
                .catch((error) => {
                    console.error('Error fetching companies:', error);
                });
        },
        getAllBranchMainRoots(){
            getAllBranchMainRoots()
            .then((data) => {
                this.mainRoots = data;
            })
        },
        openNew() {
            this.errors = [];
            this.clearCompanyDialog();
            this.companyDialog = true;
        },
        cancelClick() {
            this.companyDialog = false;
        },
        async saveClick() {
            this.errors=[];
            const normalizedCompanyName = this.companyName.replace(/\s+/g, ' ').trim();
            if (!this.companyName.trim()) {
                this.errors.push('Şirket Adı Boş Geçilemez');
            } else {
                if (!this.id) {
                    if (!this.companies.find((c) => c.companyName === normalizedCompanyName)) {
                        const newCompany = {
                            companyName: normalizedCompanyName,
                            description: this.description
                        };
                        const createdCompany = await createCompany(newCompany);
                        this.companies.push(createdCompany);
                        this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Added', life: 3000 });
                    } else {
                        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Company can be unique', life: 3000 });
                    }
                } else {
                    this.updateCompany(normalizedCompanyName);
                }
                this.getAllCompanies();
                this.clearCompanyDialog();
                this.cancelClick();
            }
        },
        clearCompanyDialog() {
            (this.id = ''), (this.companyName = ''), (this.description = '');
        },
        editCompany(editCompany) {
            this.id = editCompany.id;
            this.companyName = editCompany.companyName;
            this.description = editCompany.description;
            this.companyDialog = true;
        },
        async updateCompany(normalizedCompanyName) {
            try {
                const updatedCompany = {
                    id: this.id,
                    companyName: normalizedCompanyName,
                    description: this.description
                };
                const response = await updateCompany(this.id, updatedCompany);
                if (response === 204) {
                    this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Updated', life: 3000 });
                    this.getAll();
                } else {
                    this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Company not Updated', life: 3000 });
                }
                this.clearCompanyDialog();
                this.cancelClick();
            } catch (error) {
                console.error('Error updating company:', error);
                this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update company', life: 3000 });
            }
        },
        confirmDeleteCompany(deleteCompany) {
            this.selectedCompany = deleteCompany;
            this.deleteCompanyDialog = true;
        },
        async deleteCompany() {
            try {
                const deletedCompanyId = this.selectedCompany.id;
                const response = await deleteCompany(deletedCompanyId);
                if (response === 204) {
                    this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Company Deleted', life: 3000 });
                    this.getAll();
                } else {
                    this.$toast.add({ severity: 'error', summary: 'Eroor', detail: 'Company not Deleted', life: 3000 });
                }

                this.deleteCompanyDialog = false;
                this.selectedCompany = null;
            } catch (error) {
                console.error('Error deleting company:', error);
                this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete company', life: 3000 });
            }
            this.deleteCompanyDialog = false;
        }
    },
    mounted() {
        const toast = useToast();

        this.getAll();
        this.getAllBranchMainRoots();
    },
    computed: {
        filteredCompanies() {
            return this.companies.filter((company) => company.companyName.toLowerCase().includes(this.globalFilter.toLowerCase()));
        }
    }
};
</script>


<style>
.dropdown {
    width: 100% !important;
}

.input {
    margin-top: 30px;
}

.textarea {
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


.button-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
}

.button {
    width: 30%;
}
</style>