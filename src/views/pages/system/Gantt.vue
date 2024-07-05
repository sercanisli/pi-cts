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
                </Toolbar>
                <div id="app" >
                    <h2>Başlık</h2>
                    <div class="ganttGroup">
                        <div class="col-3">
                            <table class="table">
                                <thead>
                                <tr>
                                    <th>Görev Adı</th>
                                    <th>Sorumlu</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(item, index) in tasks" :key="index" :class="index % 2 === 0 ? 'even' : 'odd'">
                                    <td>{{ item.name }}</td>
                                    <td>{{ item.name }}</td>
                                </tr>
                                </tbody>
                            </table>
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
                    <MultiSelect v-model="selectedDependencies" :options="tasks" optionLabel="name" filter placeholder="Sorumlu Taskler" :maxSelectedLabels="3" class="w-full md:w-80 multiSelect" />
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
            </div>
        </div>
    </div>
</template>

<script>
import FrappeGantt from '../../../components/GanttChart.vue';
import { getAllTasksByProjectId, createTask } from '../../../service/fetch/tasksApi';
import { getAllLimitedUsers} from '../../../service/fetch/usersApi';
import { getAllTaskUsers, updateTaskUsers} from '../../../service/fetch/taskUsersApi';

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
            users:[],
            selectedResponsible: [],
            responsible:[],
            selectedStartDate: null,
            selectedEndDate: null,
            selectedDependencies: [],
            description: '',
            errors: [],
            tasks: [{}],
            debugEventLog: [],
            ids:[]
        };
    },
    methods: {
        async getTasks(projectId) {
            try {
                const data = await getAllTasksByProjectId(projectId);
                this.tasks = data;
            } catch (error) {
                console.error('Error fetching tasks', error);
            }
        },
        async getLimitedUsers(){
            try {
                const data = await getAllLimitedUsers();
                this.users = data;
            } catch (error) {
                console.error('Error fetching users', error);
            }
        },
        async getTaskUsers(taskId){
            try {
                const data = await getAllTaskUsers(taskId)
                this.responsible = data;
            } catch (error) {
                console.error('Error fething users', error);
            }
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
            const projectId = this.$route.params.projectId
            const normalizedName = this.name.replace(/\s+/g, ' ').trim();
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
                    const responsibleIds = this.getIds(this.selectedResponsible);
                    const dependenciesIds = this.getIds(this.selectedDependencies);
                    const newTask = {
                        projectId:projectId,
                        name:this.name,
                        start:this.selectedStartDate,
                        end:this.selectedEndDate,
                        description:this.description,
                        dependencies:dependenciesIds
                    };
                   const createdTask = await createTask(newTask);
                    this.tasks.push(newTask);
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Task Added',
                        life: 3000
                    });
                } else {
                    //update
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
        },
        getIds(items){
            this.ids=[];
            items.forEach(item => {
                this.ids.push(item.id);
            });
            return this.ids;
        }
    },
    async created() {
        this.projectId = this.$route.params.projectId;
        await this.getTasks(this.projectId);
        await this.getLimitedUsers();
    }
};
</script>

<style lang="scss">
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    //   text-align: center;
    color: #2c3e50; 
}
.ganttGroup {
    display: flex;
}

.table {
    margin-top: 54px;
  border-collapse: collapse;
  width: 100%;
}

.table th, .table td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: left;
  height: 38px; 
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

// .ganttTable{
//     margin-top: 55px;
// }
// .p-datatable tbody td {
//     height: 38px !important; /* İstediğiniz yüksekliği burada belirleyin */
// }
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
</style>
