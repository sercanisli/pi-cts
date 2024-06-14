<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Bağlantı Tipi" icon="pi pi-plus" class="mr-2" @click="openNew"/>
                        </div>
                    </template>
                    <template v-slot:end>
                        <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import" class="mr-2 inline-block" />
                    </template>
                </Toolbar>
                <DataTable
                    data-key="id" 
                    :value="filteredConnectionTypes" 
                    :globalFilter="globalFilter"
                    stripedRows  
                    paginator 
                    :rows="10" 
                    :rowsPerPageOptions="[5, 10, 20, 50]" 
                    tableStyle="min-width: 50rem"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Bağlantı Tipleri</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="globalFilter" class="w-full sm:w-auto"/>
                            </IconField>
                        </div>
                    </template>
                    <Column field="id" header="Id" style="width: 5%"></Column>
                    <Column field="type" header="Bağlantı Tipi" style="width: 20%"></Column>
                    <Column field="description" header="Açıklama" style="width: 60%">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.description" v-tooltip.top="slotProps.data.description ">
                                {{ slotProps.data.description.slice(0, 70) }}{{ slotProps.data.description.length > 70 ? '...' : '' }}
                            </span>
                        </template>
                    </Column>
                    <Column style="width: 15%">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editConnectionType(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteConnectionType(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <Dialog
                    v-model:visible="connectionTypeDialog" 
                    :style="{ width: '400px' }" 
                    header="Yeni Bağlantı Tipi" 
                    :modal="true" class="p-fluid"
                >
                    <div class="dialog-group">
                        <InputText id="type"  v-model="type" placeholder="Bağlantı Tipi Adı" class="input" />
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
                    v-model:visible="deleteConnectionTypeDialog" 
                    :style="{ width: '450px' }"
                    header="Confirm" 
                    :modal="true"
                >
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedConnectionType"
                            >Are you sure you want to delete <b>{{ selectedConnectionType.type }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteConnectionTypeDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteConnectionType" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>        
</template>


<script>
import { useToast } from 'primevue/usetoast';
import { getAllConnectionTypes, createConnectionType, updateConnectionType, deleteConnectionType } from '../../../service/fetch/connectionTypesApi';

export default {
    data(){
        return{
            id:'',
            connectionTypes:[],
            connectionType:'',
            visible:false,
            selectedConnectionType:null,
            connectionTypeDialog:false,
            type:'',
            description:'',
            deleteConnectionTypeDialog:false,
            globalFilter:'',
            errors:[]
        }
    },
    methods:{
        getAllConnectionTypes(){
            getAllConnectionTypes()
            .then(data => {
                this.connectionTypes = data;
            })
            .catch(error => {
                console.error('Error fetching connection types:', error);
            });
        },
        openNew(){
            this.errors=[];
            this.clearConnectionTypeDialog();
            this.connectionTypeDialog=true;
        },
        cancelClick(){
            this.connectionTypeDialog=false;
        },
        async saveClick(){
            this.errors=[];
            const normalizedConnectionType = this.type.replace(/\s+/g, ' ').trim();
            if(!this.type.trim()){
                this.errors.push("Bağlantı Tipi boş geçilemez");
            } else {
                if(!this.id){
                    if(!this.connectionTypes.find(ct=>ct.type === normalizedConnectionType)){
                        const newConnectionType = {
                            type:normalizedConnectionType,
                            description:this.description
                        }
                        const createdConnectionType = await createConnectionType(newConnectionType);
                        this.connectionTypes.push(createdConnectionType);
                        this.$toast.add({severity: 'success', summary:'Successful', detail:'Connection Type Added', life:3000});
                    } else {
                        this.$toast.add({severity: 'error', summary:'Error', detail:'Connection Type can be unique', life:3000});
                    }
                } else {
                    this.updateConnectionType(normalizedConnectionType);
                }
                this.getAllConnectionTypes();
                this.clearConnectionTypeDialog();
                this.cancelClick();
            }
        },
        clearConnectionTypeDialog(){
            this.id='';
            this.type='';
            this.description='';
        },
        editConnectionType(editConnectionType){
            this.id=editConnectionType.id;
            this.type=editConnectionType.type;
            this.description=editConnectionType.description;
            this.connectionTypeDialog = true;
        },
        async updateConnectionType(normalizedConnectionType){
            try {
                const updatedConnectionType = {
                    id:this.id,
                    type:normalizedConnectionType,
                    description:this.description
                };
                const response = await updateConnectionType(this.id, updatedConnectionType);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary: 'Successful', detail: 'Connection Type Updated', life: 3000});
                    this.getAllConnectionTypes();
                } else {
                    this.$toast.add({severity: 'error', summary: 'Error', detail: 'Connection Type not Updated', life: 3000});
                }
                this.clearConnectionTypeDialog();
                this.cancelClick();
            } catch (error) {
                console.error('Error updating connection type:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update connection type', life: 3000});
            }
        },
        confirmDeleteConnectionType(deleteConnectionType){
            this.selectedConnectionType = deleteConnectionType;
            this.deleteConnectionTypeDialog = true;
        },
        async deleteConnectionType(){
            try {
                const deletedConnectionTypeId = this.selectedConnectionType.id;
                const response = await deleteConnectionType(deletedConnectionTypeId);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary:'Successful', detail:'Connection Type Deleted', life:3000});
                    this.getAllConnectionTypes();
                } else {
                    this.$toast.add({severity: 'error', summary:'Eroor', detail:'Connection Type not Deleted', life:3000});
                }

                this.deleteConnectionTypeDialog = false;
                this.selectedConnectionType = null;
            } catch (error) {
                console.error('Error deleting connection type:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to delete connection typr', life: 3000});
            }
            this.deleteConnectionTypeDialog=false;
        }
    },
    mounted(){
        const toast = useToast();

        this.getAllConnectionTypes();
    },
    computed: {
        filteredConnectionTypes() {
            return this.connectionTypes.filter(ct=>ct.type.toLocaleLowerCase().includes(this.globalFilter.toLocaleLowerCase()));
        }
    }
}
</script>


<style>

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