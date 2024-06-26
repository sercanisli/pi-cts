<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4"> 
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Bağlantı" icon="pi pi-plus" class="mr-2" @click="openNew" />
                        </div>
                    </template>
                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                    </template>
                </Toolbar>
                <DataTable
                    v-model:expandedRowGroups="expandedRowGroups"
                    :value="filteredConnections"
                    expandableRowGroups
                    rowGroupMode="subheader"
                    groupRowsBy="branchCompanyId"
                    :globalFilter="globalFilter"
                    sortMode="single"
                    sortField="branchCompanyCompanyName"
                    :sortOrder="1"
                    stripedRows
                    paginator
                    :rows="50"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    tableStyle="min-width: 50rem"
                    v-if="branches.length > 0"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Bağlantılar</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="globalFilter" class="w-full sm:w-auto" placeholder="Şirket ya da Şube adı" />
                            </IconField>
                        </div>
                    </template>
                    <template #groupheader="slotProps">
                        <span class="vertical-align-middle ml-2 font-bold line-height-3">{{ slotProps.data.branchCompanyCompanyName }}</span>
                    </template>
                    <Column field="id" header="Id" style="width: 5%"></Column>
                    <Column field="branchBranchName" header="Şube" style="width: 10%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.branchId">
                                {{ slotProps.data.branchBranchName }}
                            </span>
                        </template>
                    </Column>
                    <Column field="connectionTypeId" header="Bağlantı Türü" style="width: 10%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.connectionTypeId">
                                {{ getConnectionTypeName(slotProps.data.connectionTypeId) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="link" header="Bağlantı" style="width: 15%"></Column>
                    <Column field="username" header="Kullanıcı Adı" style="width: 10%"></Column>
                    <Column field="password" header="Şifre" style="width: 10%"></Column>
                    <Column field="description" header="Açıklama" style="width: 20%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.description" v-tooltip.top="slotProps.data.description"> {{ slotProps.data.description.slice(0, 20) }}{{ slotProps.data.description.length > 20 ? '...' : '' }} </span>
                        </template>
                    </Column>
                    <Column style="width: 10%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editConnection(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteConnection(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <Dialog v-model:visible="connectionDialog" :style="{ width: '400px' }" header="Yeni Bağlantı" :modal="true" class="p-fluid">
                    <div class="dialog-group">
                        <Dropdown v-model="selectedCompany" :options="companies" optionLabel="companyName" :placeholder="'Şirket Seçiniz'" class="w-full md:w-14rem dropdown" @change="getBranchForDropdown" />
                        <Dropdown v-model="selectedBranch" :options="filteredBranches" optionLabel="branchName" :placeholder="'Şube Seçiniz'" class="w-full md:w-14rem dropdown" />
                        <Dropdown v-model="selectedConnectionType" :options="connectionTypes" optionLabel="type" :placeholder="'Bağlantı Türü Seçiniz'" class="w-full md:w-14rem dropdown" />
                        <InputText id="link" v-model="link" placeholder="Bağlantı Adresi" class="input" />
                        <InputText id="username" v-model="username" placeholder="Kullanıcı Adı" class="input" />
                        <InputText id="password" v-model="password" placeholder="Şifre" class="input" />
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
                <Dialog v-model:visible="deleteConnectionDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedCompany && selectedBranch && selectedConnection"
                            >Are you sure you want to delete <b> {{ selectedCompany }} - {{ selectedBranch }} - {{ selectedConnection.link }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteConnectionDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteConnection" />
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
import { getAllLimitedConnectionTypes } from '../../../service/fetch/connectionTypesApi';
import { getAllConnections, createConnection, updateConnection, deleteConnection } from '../../../service/fetch/connectionsApi';

export default {
    data() {
        return {
            id: '',
            connections: [],
            companies: [],
            branches: [],
            connectionTypes: [],
            connection: '',
            link: '',
            username: '',
            password: '',
            description: '',
            selectedConnection: null,
            selectedCompany: null,
            selectedBranch: null,
            selectedConnectionType: null,
            visible: '',
            globalFilter: '',
            connectionDialog: false,
            deleteConnectionDialog: false,
            expandedRowGroups: null,
            errors:[]
        };
    },
    methods: {
        getAllConnections(){
            getAllConnections()
            .then(data=> {
                this.connections=data;
            })
            .catch(error => {
                console.error('Error fetching connections:', error);
            });
        },
        getAllLimitedCompanies(){
            getAllLimitedCompanies()
            .then(data => {
                this.companies = data;
            })
            .catch(error => {
                console.error('Error fetching comapnies', error);
            });
        },
        getAllLimitedBranches(){
            getAllLimitedBranches()
            .then(data => {
                this.branches = data;
            })
            .catch(error => {
                console.error('Error fetching branches', error);
            });
        },
        getAllLimitedConnectionTypes(){
            getAllLimitedConnectionTypes()
            .then(data => {
                this.connectionTypes = data;
            })
            .catch(error => {
                console.error('Error fetching connection types:', error);
            });
        },
        openNew() {
            this.errors=[];
            this.clearConnectionDialog();
            this.connectionDialog = true;
        },
        cancelClick() {
            this.connectionDialog = false;
        },
        async saveClick() {
            this.errors=[]; 
            const normalizedLink = this.link.replace(/\s+/g, ' ').trim();
            const normalizedUsername = this.username.replace(/\s+/g, ' ').trim();
            const normalizedPassword = this.password.replace(/\s+/g, ' ').trim();
            if(!this.selectedCompany){
                this.errors.push("Lütfen bir şirket seçiniz");
            } else if(!this.selectedBranch){
                this.errors.push("Lütfen bir şirket seçiniz");
            } else if(!this.selectedConnectionType){
                this.errors.push("Lütfen bir bağlantı türü seçiniz");
            } else if(!this.link.trim()){
                this.errors.push("Bağlantı adresi boş geçilemez");
            } else {
                if (!this.id) {
                    const branchId = this.selectedBranch.id;
                    const connectionTypeId = this.selectedConnectionType.id;
                    const newConnection = {
                        branchId: branchId,
                        connectionTypeId: connectionTypeId,
                        link: normalizedLink,
                        username: normalizedUsername,
                        password: normalizedPassword,
                        description: this.description
                    };
                    const createdConnection = await createConnection(newConnection);
                    const newConnectionBranchId = this.selectedBranch.id;
                    const parentConnection = this.connections.find((connection) => connection.branchId === newConnectionBranchId);
                    if (parentConnection) {
                        this.connections.splice(this.connections.indexOf(parentConnection) + 1, 0, newConnection);
                    } else {
                        this.connections.push(createdConnection);
                    }
                    this.clearConnectionDialog();
                    this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Connection Added', life: 3000 });
                } else {
                    this.updateConnection(normalizedLink, normalizedUsername, normalizedPassword);
                }
                this.clearConnectionDialog();
                this.getAllConnections();
                this.cancelClick();
            }
        },
        clearConnectionDialog() {
            this.id = '';
            this.selectedCompany = null;
            this.selectedBranch = null;
            this.selectedConnectionType = null;
            this.link = '';
            this.username = '';
            this.password = '';
            this.description = '';
        },
        editConnection(editConnection) {
            this.id = editConnection.id;

            const companyName = this.getCompanyName(editConnection.branchId);
            // const branchName = this.getBranchName(editConnection.branchId);
            const connectionType = this.getConnectionTypeName(editConnection.connectionTypeId);

            this.selectedCompany = this.companies.find((company) => company.companyName === companyName);
            this.selectedBranch = this.branches.find((branch) => branch.id === editConnection.branchId);
            this.selectedConnectionType = this.connectionTypes.find((ct) => ct.type === connectionType);

            this.link = editConnection.link;
            this.username = editConnection.username;
            this.password = editConnection.password;
            this.description = editConnection.description;

            this.getBranchForDropdown();
            this.connectionDialog = true;
        },
        async updateConnection(normalizedLink, normalizedUsername, normalizedPassword) {
            const branchId = this.selectedBranch.id;
            const connectionTypeId = this.selectedConnectionType.id;
            try {
                const updatedConnection = {
                    id:this.id,
                    branchId:branchId,
                    connectionTypeId:connectionTypeId,
                    link:normalizedLink,
                    username:normalizedUsername,
                    password:normalizedPassword,
                    description:this.description
                }
                const response = await updateConnection(this.id, updatedConnection);
                if(response === 204 ){
                    this.$toast.add({severity: 'success', summary: 'Successful', detail: 'Connection Updated', life: 3000});
                    this.getAllConnections();
                    this.getAllLimitedBranches();
                    this.getAllLimitedCompanies();
                    this.getAllLimitedConnectionTypes();
                } else {
                    this.$toast.add({severity: 'error', summary: 'Error', detail: 'Connection not Updated', life: 3000});
                }
                this.clearConnectionDialog();
                this.cancelClick();
            } catch (error) {
                console.error('Error updating connection', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update connection', life: 3000});
            }
        },
        confirmDeleteConnection(deleteConnection) {
            const companyName = this.getCompanyName(deleteConnection.branchId);
            const branchName = this.getBranchName(deleteConnection.branchId);
            this.selectedConnection = deleteConnection;
            this.selectedCompany = companyName;
            this.selectedBranch = branchName;
            this.deleteConnectionDialog = true;
        },
        async deleteConnection() {
            const deletedConnectionId = this.selectedConnection.id;
            try {
                const response= await deleteConnection(deletedConnectionId);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary:'Successful', detail:'Connection Deleted', life:3000});
                    this.getAllConnections();
                    this.getAllLimitedBranches();
                    this.getAllLimitedCompanies();
                    this.getAllLimitedConnectionTypes();
                } else {
                    this.$toast.add({severity: 'error', summary:'Eroor', detail:'Connection not Deleted', life:3000});
                }
                this.deleteConnectionDialog=false;
                this.selectedConnection = null;
            } catch (error) {
                console.error('Error deleting connection', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to delete connection', life: 3000});
            }
            this.deleteConnectionDialog = false;
        },
        getBranchForDropdown() {
            const selectedCompanyId = this.selectedCompany.id;
            const filteredBranches = [];

            this.branches.forEach((branch) => {
                if (branch.companyId === selectedCompanyId) {
                    filteredBranches.push(branch);
                }
            });
            this.filteredBranches = filteredBranches;
        },
        getBranch(branchId) {
            return this.branches.find((branch) => branch.id === branchId);
        },
        getBranchName(branchId) {
            const branch = this.getBranch(branchId);
            return branch ? branch.branchName : '';
        },
        getBranchId(branchName) {
            const branch = this.branches.find((branch) => branch.branchName === branchName);
            return branch ? branch.id : '';
        },
        getCompanyId(companyName) {
            const company = this.companies.find((company) => company.companyName === companyName);

            return company ? company.id : '';
        },
        getCompanyName(branchId) {
            const branch = this.getBranch(branchId);
            if (!branch) {
                return '';
            }

            const company = this.companies.find((company) => company.id === branch.companyId);
            return company ? company.companyName : '';
        },
        getCompanyIdFromBranchId(data) {
            const branchesIds = data.map((d) => d.branchId);
            const companyIds = branchesIds.map((branchId) => {
                const branch = this.branches.find((branch) => branch.id === branchId);
                return branch ? branch.companyId : null;
            });
            return companyIds;
        },
        getCompanyIdFromBranchIdForRowGroup(branchId){
            const branch = this.branches.find((branch) => branch.id === branchId);
            return branch ? branch.companyId : null; 
        },  
        getConnectionType(connectionTypeId) {
            return this.connectionTypes.find((ct) => ct.id === connectionTypeId);
        },
        getConnectionTypeName(connectionTypeId) {
            const connectionType = this.getConnectionType(connectionTypeId);
            return connectionType ? connectionType.type : '';
        },
        getConnectionTypeId(type) {
            const connectionType = this.connectionTypes.find((connectionType) => connectionType.type === type);

            return connectionType ? connectionType.id : '';
        },
        getCompanyNameByCompanyId(companyId) {
            const company = this.companies.find((company) => company.id === companyId);
            return company ? company.companyName : '';
        }
    },
    mounted() {
        const toast = useToast();

        this.getAllConnections();
        this.getAllLimitedCompanies();
        this.getAllLimitedBranches();
        this.getAllLimitedConnectionTypes();

        const companyBranches = {};

        this.branches.forEach((branch) => {
            if (!companyBranches[branch.companyId]) {
                companyBranches[branch.companyId] = [];
            }
            companyBranches[branch.companyId].push(branch);
        });
    },
    computed: {
        filteredConnections() {
            return this.connections.filter((connection) => {
                const companyId = this.getBranch(connection.branchId).companyId;
                const companyName = this.getCompanyNameByCompanyId(companyId);
                const branchName = this.getBranchName(connection.branchId);
                return companyName.toLowerCase().includes(this.globalFilter.toLowerCase()) || branchName.toLowerCase().includes(this.globalFilter.toLowerCase());
            });
        }
    }
};
</script>


<style>
.dropdown {
    width: 100% !important;
    margin-top: 30px;
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