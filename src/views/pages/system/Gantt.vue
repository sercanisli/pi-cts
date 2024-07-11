<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <Button label="Yeni Görev" icon="pi pi-plus" class="mr-2" @click="openNew" />
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-2">
                            <Button label="Kaydet"  icon="pi pi-save" class="mr-2" />
                        </div>
                    </template>
                </Toolbar>
                <div id="app">
                    <h2>{{ projectHeader }}</h2>
                    <div class="ganttGroup">
                        <div class="col-3">
                            <DataTable data-key="id" :value="tasks" stripedRows tableStyle="w-full" class="dataTable">
                                <Column style="widht: 14%">
                                    <template #body="slotProps">
                                        <Button icon="pi pi-pencil" severity="success" class="ml-1 mr-1" @click="editTask(slotProps.data)" />
                                        <Button icon="pi pi-trash" severity="warning" class="ml-1 mr-1" @click="confirmDeleteTask(slotProps.data)" />
                                    </template>
                                </Column>
                                <Column field="name" header="Görev" style="widht: 43%">
                                    <template #body="slotProps">
                                        <span v-if="slotProps.data.name" v-tooltip.top="slotProps.data.name"> {{ slotProps.data.name.slice(0, 10) }} {{ slotProps.data.name.length > 10 ? '..' : '' }} </span>
                                    </template>
                                </Column>
                                <Column field="users" header="Sorumlu" style="width: 43%">
                                    <template #body="slotProps">
                                        <span v-if="slotProps.data.users.length > 0" v-tooltip.top="slotProps.data.users.join(', ')">
                                            {{ getUserNames(slotProps.data) }}
                                        </span>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                        <div class="col-9">
                            <Button label="Günlük" severity="secondary" @click="demoViewMode('day')" text />
                            <Button label="Haftalık" severity="secondary" @click="demoViewMode('week')" text />
                            <Button label="Aylık" severity="secondary" @click="demoViewMode('month')" text />
                            <frappe-gantt :view-mode="mode" :tasks="tasks" @task-updated="debugEventLog.push($event)" @task-date-updated="debugEventLog.push($event)" @task-progress-change="debugEventLog.push($event)" />
                        </div>
                    </div>
                </div>
                <Dialog v-model:visible="taskDialog" :style="{ width: '400px' }" header="Yeni Proje" :modal="true" class="p-fluid">
                    <InputText id="name" v-model="name" placeholder="Task Adı" class="input" />
                    <MultiSelect v-model="selectedResponsible" :options="users" optionLabel="userName" filter placeholder="Sorumlu Kişi" :maxSelectedLabels="3" class="w-full md:w-80 multiSelect" />
                    <Calendar placeholder="Başlanma Tarihi" v-model="selectedStartDate" showIcon iconDisplay="input" inputId="icondisplay" class="calendar" />
                    <Calendar placeholder="Bitiş Tarihi" v-model="selectedEndDate" showIcon iconDisplay="input" inputId="icondisplay" class="calendar" />
                    <MultiSelect v-model="selectedDependencies" :options="tasks" optionLabel="name" filter placeholder="Bağımlı Olacağı Görevler" :maxSelectedLabels="3" class="w-full md:w-80 multiSelect" />
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
                </Dialog>
                <Dialog v-model:visible="deleteTaskDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="selectedTask"
                            >Are you sure you want to delete <b> {{ selectedTask.name }} </b> ?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" text @click="deleteTaskDialog = false" />
                        <Button label="Yes" icon="pi pi-check" text @click="deleteTask" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<script>
import FrappeGantt from '../../../components/GanttChart.vue';
import { getAllTasksByProjectId, createTask, deleteTask, updateTask } from '../../../service/fetch/tasksApi';
import { getAllLimitedUsers } from '../../../service/fetch/usersApi';
import { getAllTaskUsers, updateTaskUsers } from '../../../service/fetch/taskUsersApi';
import { getOneProject, updateProject } from '../../../service/fetch/projectsApi';

export default {
    name: 'App',
    components: {
        FrappeGantt
    },
    data() {
        return {
            mode: 'day',
            id: null,
            projectId: null,
            taskDialog: false,
            name: '',
            users: [],
            selectedResponsible: [],
            responsible: [],
            selectedStartDate: null,
            selectedEndDate: null,
            selectedDependencies: [],
            dependencies: [],
            description: '',
            errors: [],
            tasks: [{}],
            debugEventLog: [],
            ids: [],
            users: [],
            userNames: [],
            selectedTask: null,
            deleteTaskDialog: false,
            startDates:[],
            endDates:[],
            startDate:null,
            endDate:null,
            projectHeader:null
        };
    },
    created() {
        this.projectId = this.$route.params.projectId;
        this.getTasks(this.projectId)
        .then(() => {
            this.getFisrtStartDate();
            this.getLastEndDate();
            this.updateProject();
        });
        this.getLimitedUsers();
    },
    methods: {
        async getTasks(taskId) {
            this.projectId = this.$route.params.projectId;
            try {
                const data = await getAllTasksByProjectId(taskId);
                if (data.length === 0) {
                    this.tasks = [
                        {
                            id: null,
                            name: null,
                            start: null,
                            end: null
                        }
                    ];
                } else {
                    this.tasks = data;
                    this.tasks.forEach((task) => {
                        this.dependencies.push(task.dependencies);
                    });
                }
            } catch (error) {
                console.error('Error fetching tasks', error);
            }
        },
        async getLimitedUsers() {
            try {
                const data = await getAllLimitedUsers();
                this.users = data;
            } catch (error) {
                console.error('Error fetching users', error);
            }
        },
        getTaskUsers(taskId) {
            getAllTaskUsers(taskId)
                .then((data) => {
                    this.responsible = data;
                })
                .catch((error) => {
                    console.error('Error fetching task users:', error);
                });
        },
        demoViewMode(viewMode) {
            this.mode = viewMode;
        },
        openNew() {
            this.clearTaskDialog();
            this.errors = [];
            this.taskDialog = true;
        },
        async saveClick() {
            this.errors = [];
            const newUserTaskArray = [];
            const projectId = this.$route.params.projectId;
            const normalizedName = this.name.replace(/\s+/g, ' ').trim();
            this.selectedResponsible.forEach((sR) => {
                this.userNames.push(sR.userName);
            });
            const responsibleIds = this.getIds(this.selectedResponsible);
            const dependenciesIds = this.getIds(this.selectedDependencies);
            if (!this.name.trim()) {
                this.errors.push('Task adı boş geçilemez..');
            } else if (!this.selectedStartDate) {
                this.errors.push('Başlama Tarihi boş geçilemez..');
            } else if (!this.selectedEndDate) {
                this.errors.push('Bitiş Tarihi boş geçilemez..');
            } else if (this.selectedEndDate < this.selectedStartDate) {
                this.errors.push('Task bitiş tarihi, başlama tarihinden küçük olamaz');
            } else {
                if (!this.id) {
                    const newTask = {
                        projectId: projectId,
                        name: normalizedName,
                        start: this.selectedStartDate,
                        end: this.selectedEndDate,
                        description: this.description,
                        dependencies: dependenciesIds,
                        users: this.userNames
                    };
                    this.tasks.push(newTask);
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Task Added',
                        life: 3000
                    });
                    const createdTask = await createTask(newTask);
                    const taskId = createdTask.id;
                    try {
                        responsibleIds.forEach((resId) => {
                            const newTaskUser = {
                                taskId: taskId,
                                userId: resId
                            };
                            newUserTaskArray.push(newTaskUser);
                        });
                        const response = await updateTaskUsers(taskId, newUserTaskArray);
                        if (response === 204) {
                            this.$toast.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Task Users Updated',
                                life: 3000
                            });
                        }
                    } catch (error) {
                        console.error('Error updating task users:', error);
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update task users',
                            life: 3000
                        });
                    }
                } else {
                    this.updateTask(projectId, normalizedName, dependenciesIds, responsibleIds);
                }
                this.clearTaskDialog();
                this.getTasks(projectId);
                this.cancelClick();
            }
        },
        cancelClick() {
            this.taskDialog = false;
        },
        clearTaskDialog() {
            this.id = null;
            this.projectId = null;
            this.name = '';
            this.selectedResponsible = [];
            this.selectedStartDate = null;
            this.selectedEndDate = null;
            this.selectedDependencies = [];
            this.description = '';
            this.userNames = [];
        },
        getIds(items) {
            this.ids = [];
            items.forEach((item) => {
                this.ids.push(item.id);
            });
            return this.ids;
        },
        getUserNames(data) {
            const responsibleUsers = data.users;
            if (responsibleUsers && responsibleUsers.length > 0) {
                const totalLength = responsibleUsers.join(', ').length;

                if (totalLength > 10) {
                    return responsibleUsers.join(', ').slice(0, 10) + '..';
                } else {
                    return responsibleUsers.join(', ');
                }
            } else {
                return '';
            }
        },

        editTask(updateTask) {
            this.clearTaskDialog();

            this.id = updateTask.id;
            this.projectId = updateTask.projectId;
            this.name = updateTask.name;
            this.selectedStartDate = updateTask.start;
            this.selectedEndDate = updateTask.end;
            this.description = updateTask.description;

            this.selectedResponsible = this.users.filter((user) => updateTask.users.includes(user.userName));
            this.selectedDependencies = this.tasks.filter((task) => updateTask.dependencies.includes(task.id));

            this.taskDialog = true;
        },
        async updateTask(projectId, normalizedName, dependenciesIds, responsibleIds) {
            try {
                const updatedTask = {
                    id: this.id,
                    projectId: projectId,
                    name: normalizedName,
                    start: this.selectedStartDate,
                    end: this.selectedEndDate,
                    description: this.description,
                    dependencies: dependenciesIds,
                    users: this.userNames
                };
                const response = await updateTask(this.id, updatedTask);
                if (response === 204) {
                    this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Task Updated', life: 3000 });
                    this.getTasks(projectId);
                } else {
                    this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Task not Updated', life: 3000 });
                }
                this.clearTaskDialog();
                this.cancelClick();
            } catch (error) {
                console.error('Error updating task:', error);
                this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update task', life: 3000 });
            }
        },
        confirmDeleteTask(deleteTask) {
            const taskName = deleteTask.name;
            this.selectedTask = deleteTask;
            this.deleteTaskDialog = true;
        },
        async deleteTask() {
            const deletedTaskId = this.selectedTask.id;
            this.projectId = this.$route.params.projectId;
            try {
                const response = await deleteTask(deletedTaskId, this.projectId);
                if (response === 204) {
                    this.$toast.add({ severity: 'success', summary: 'Successful', detail: 'Task Deleted', life: 3000 });
                    this.getTasks(this.projectId);
                    this.getLimitedUsers();
                } else {
                    this.$toast.add({ severity: 'error', summary: 'Eroor', detail: 'Task not Deleted', life: 3000 });
                }
                this.deleteTaskDialog = false;
                this.selectedTask = null;
            } catch (error) {
                console.error('Error deleting task:', error);
                this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete task', life: 3000 });
            }
            this.deleteTaskDialog = false;
        },
        getFisrtStartDate(){
            this.tasks.forEach(task => {
                this.startDates.push(task.start);
            });

            this.startDates = this.quickSort(this.startDates);
            this.startDate = this.startDates[0];
        },
        getLastEndDate(){
            this.tasks.forEach(task =>{
                this.endDates.push(task.end);
            });
            this.endDates = this.quickSort(this.endDates);
            const endDatesLength = this.endDates.length;
            this.endDate = this.endDates[endDatesLength-1];
        },
        quickSort(arr){
            if(arr.length <= 1){
                return arr;
            }

            const pivot = arr[0];
            const left = [];
            const right = [];

            for(let i = 1 ; i<arr.length; i++){
                if(arr[i]<pivot){
                    left.push(arr[i]);
                } else {
                    right.push(arr[i]);
                }
            }
            return [...this.quickSort(left), pivot, ...this.quickSort(right)];
        },
        async updateProject(){
            this.projectId = this.$route.params.projectId;
            const project = await getOneProject(this.projectId);
            this.projectHeader = project.projectName;
            try {
                const updatedProject ={
                    id:this.projectId,
                    companyId:project.companyId,
                    projectName:project.projectName,
                    startDate:this.startDate,
                    endDate:this.endDate,
                    description:project.description,
                    statutes:project.statutes
                };
                await updateProject(this.projectId, updatedProject);
            } catch (error) {
                console.error('Error updating project dates:', error);
            }
        }
    }
};
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}
.ganttGroup {
    display: flex;
}

.dataTable {
    margin-top: 55px;
    border-collapse: collapse;
    width: 100%;
}

.dataTable th,
.dataTable td {
    padding: 8px;
    height: 38px;
    align-items: center;
    padding: 0px;
}

.table th {
    background-color: #ffffff;
}

.table tbody tr:nth-child(even) {
    background-color: #f5f5f5;
}

.table tbody tr:nth-child(odd) {
    background-color: #ffffff;
}

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

.calendar {
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

.itemButtonGroup {
    display: flex;
    align-items: center;
}
</style>