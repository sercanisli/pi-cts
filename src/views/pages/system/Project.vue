<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Proje" icon="pi pi-plus" class="mr-2" @click="openNew" />
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-2">
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText v-model="globalFilter" class="w-full sm:w-auto" />
                            </IconField>
                        </div>
                    </template>
                </Toolbar>
                <div class="mb-4 col-12">
                    <div class="grid grid-cols-3 sm:grid-cols-12 md:grid-cols-6 justify-content-center">
                        <div v-for="(item, index) in displayedCards" :key="index" class="m-2 col-span-1">
                            <div class="card" style="width: 22rem; overflow: hidden; border-radius: 8px; padding: 1rem">
                                <h3>{{ item.projectName }}</h3>
                                <p>{{ item.companyCompanyName }}</p>
                                <p>
                                    {{ item.description }}
                                </p>
                                <p>Başlama Tarihi : {{ getDate(item.startDate) }}</p>
                                <p>Bitiş Tarihi : {{ getDate(item.endDate) }}</p>
                                <p style="text-decoration: underline; cursor: pointer" class="text-blue-500" @click="goToTask(item.id)">Proje görevleri <i class="pi pi-arrow-right ml-2"></i></p>
                                <div class="flex gap-4 mt-1">
                                    <Button icon="pi pi-pencil" severity="success" class="w-full" @click="editProject(item)" />
                                    <Button icon="pi pi-trash" severity="danger" class="w-full" @click="confirmDeleteProject(item)"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5">
                        <Paginator v-model:currentPage="currentPage" :totalRecords="projects.length" :rows="itemsPerPage" :rowsPerPageOptions="[4, 8, 24, 48]" @page="onPage($event)" />
                    </div>
                    <Dialog v-model:visible="projectDiaglog" :style="{ width: '400px' }" header="Yeni Proje" :modal="true" class="p-fluid">
                        <div class="projectDialog-group">
                            <InputText id="projectName" v-model="projectName" placeholder="Proje Adı" class="input" />
                            <Dropdown v-model="selectedCompany" :options="companies" optionLabel="companyName" :placeholder="'Şirket Seçiniz'" class="w-full md:w-14rem dropdown" @change="getBranchForDropdown" />
                            <!-- <Calendar placeholder="Başlanma Tarihi" v-model="selectedStartDate" showIcon iconDisplay="input" inputId="icondisplay" class="calendar"/>
                            <Calendar placeholder="Bitiş Tarihi" v-model="selectedEndDate" showIcon iconDisplay="input" inputId="icondisplay" class="calendar"/> -->
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
                    <Dialog v-model:visible="deleteProjectDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="projectName && selectedCompany "
                            >Are you sure you want to delete <b>{{ selectedCompany }} - {{ projectName }}</b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteProjectDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteProject" />
                    </template>
                </Dialog>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAllProjects, updateProject, createProject, deleteProject } from '../../../service/fetch/projectsApi';
import { getAllLimitedCompanies } from '../../../service/fetch/comapniesApi';
export default {
    data() {
        return {
            projects: [],
            companies: [],
            displayedCards: [],
            currentPage: 0,
            itemsPerPage: 8,
            id: null,
            projectName: '',
            projectStartDate: null,
            selectedStartDate:null,
            projectEndDate: null,
            selectedEndDate:null,
            description: null,
            projectDiaglog: false,
            companies: [],
            selectedCompany: null,
            errors: [],
            status: null,
            deleteProjectDialog: false,
            selectedConnectionForDelete:false
        };
    },
    methods: {
        async getPorjets() {
            try {
                const data = await getAllProjects();
                this.projects = data;
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        },
        getCompanies(){
            getAllLimitedCompanies()
            .then(data => {
                this.companies = data;
            })
            .catch(error =>{
                console.error('Error fething companies:',error);
            })
        },
        onPage(event) {
            this.currentPage = event.page;
            this.itemsPerPage = event.rows;
            this.updateDisplayedCards(event);
        },
        updateDisplayedCards() {
            const startIndex = this.currentPage * this.itemsPerPage;
            const endIndex = Math.min(startIndex + this.itemsPerPage, this.projects.length);
            this.displayedCards = this.projects.slice(startIndex, endIndex);
        },
        openNew() {
            this.errors = [];
            this.clearProjectDialog();
            this.projectDiaglog = true;
        },
        cancelClick() {
            this.projectDiaglog = false;
        },
        async saveClick() {
            this.errors = [];
            const normalizedProjectName = this.projectName.replace(/\s+/g, ' ').trim();
            if (!this.projectName.trim()) {
                this.errors.push('Proje adı boş geçilemez..');
            } else if (!this.selectedCompany) {
                this.errors.push('Lütfen bir şirket seçiniz..');
            } else if(this.selectedEndDate<this.selectedStartDate) {
                this.errors.push('Proje bitiş tarihi, başlama tarihinden küçük olamaz.');
            } else {
                if (!this.id) {
                    const newProject = {
                        projectName: normalizedProjectName,
                        companyId:this.selectedCompany.id,
                        // startDate: this.selectedStartDate.toLocaleDateString('en-US'),
                        // endDate: this.selectedEndDate.toLocaleDateString('en-US'),
                        description: this.description,
                        statuses: 0
                    };
                    const createdProject = await createProject(newProject);
                    this.projects.push(createdProject);
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Project Added',
                        life: 3000
                    });
                } else {
                    this.updateProject(normalizedProjectName);
                }
                this.clearProjectDialog();
                this.getPorjets().then(() => {
                    this.updateDisplayedCards();
                });
                this.getCompanies();
                this.cancelClick();
            }
        },
        clearProjectDialog() {
            this.id = null;
            this.projectName = '';
            this.selectedCompany = null;
            this.description = null;
        },
        goToTask(id) {
            this.$router.push({name : 'tasks', params: { projectId: id } });
        },
        editProject(editProject){
            this.id = editProject.id;
            this.projectName = editProject.projectName;
            this.selectedCompany = this.companies.find((company) => company.id === editProject.companyId);
            this.description = editProject.description;

            this.projectDiaglog = true;
        },
        async updateProject(normalizedProjectName){
            const companyId = this.selectedCompany.id;
            try {
                const updatedProject = {
                    id:this.id,
                    companyId: this.selectedCompany.id,
                    projectName:normalizedProjectName,
                    description:this.description
                }
                const response = await updateProject(this.id, updatedProject);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary: 'Successful', detail: 'Project Updated', life: 3000});
                    this.getPorjets().then(() => {
                        this.updateDisplayedCards();
                    });
                    this.getCompanies();
                } else {
                    this.$toast.add({severity: 'error', summary: 'Error', detail: 'Project not Updated', life: 3000});
                }
                this.clearProjectDialog();
                this.cancelClick();
            } catch (error) {
                console.error('Error updating project:', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update project', life: 3000});
            }
        },
        confirmDeleteProject(deleteProject){
            this.projectName = deleteProject.projectName;
            this.selectedCompany = deleteProject.companyCompanyName;
            this.selectedConnectionForDelete = deleteProject;
            this.deleteProjectDialog = true;
        },
        async deleteProject(){
            const deletedProjectId = this.selectedConnectionForDelete.id;
            try {
                const response = await deleteProject(deletedProjectId);
                if(response === 204){
                    this.$toast.add({severity: 'success', summary:'Successful', detail:'Project Deleted', life:3000});
                    this.getPorjets().then(() => {
                        this.updateDisplayedCards();
                    });
                    this.getCompanies;
                } else {
                    this.$toast.add({severity: 'error', summary:'Eroor', detail:'Project not Deleted', life:3000});
                }
            } catch (error) {
                console.error('Error deleting project', error);
                this.$toast.add({severity: 'error', summary: 'Error', detail: 'Failed to delete project', life: 3000});
            }
            this.deleteProjectDialog = false;
        },
        getDate(date){
            const newDate = new Date(date);
            const day = newDate.getDate();
            const month = newDate.getMonth() + 1; 
            const year = newDate.getFullYear();

            return `${day.toString()}/${month.toString()}/${year}`;
        }
    },
    created() {
        this.getPorjets().then(() => {
            this.updateDisplayedCards();
        });
        this.getCompanies();
    }
};
</script>

<style scoped>
.dropdown {
    width: 100% !important;
    margin-top: 30px;
}

.multiSelect {
    width: 100% !important;
    margin-top: 30px;
}

.input {
    margin-top: 30px;
}

.calendar{
    margin-top: 30px;
}

.textarea {
    margin-top: 30px;
}

.error-message {
    margin-top: 10px;
    align-content: center;
    justify-content: center;
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
