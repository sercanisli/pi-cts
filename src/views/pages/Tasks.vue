<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="ganttGroup">
                    <div class="col-2">
                        <DataTable dataKey="id" :value="tasks" stripedRows tableStyle="w-full" class="dataTable">
                            <Column field="users" header="Sorumlu" style="width: 43%">
                                <template #body="slotProps">
                                    <span v-if="slotProps.data.users.length > 0" v-tooltip.top="slotProps.data.users.join(', ')">
                                        {{ getUserNames(slotProps.data) }}
                                    </span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <div class="col-10">
                        <Button label="Günlük" severity="secondary" @click="demoViewMode('day')" text />
                        <Button label="Haftalık" severity="secondary" @click="demoViewMode('week')" text />
                        <Button label="Aylık" severity="secondary" @click="demoViewMode('month')" text />
                        <frappe-gantt id="svg" :view-mode="mode" :tasks="tasks" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAllTasksByProjectId } from '../../service/fetch/tasksApi';
import FrappeGantt from '../../components/GanttChartForProjectsTasks.vue';
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

export default {
    name: 'App',
    components: {
        FrappeGantt
    },
    data() {
        return {
            mode: 'day',
            projectId: null,
            tasks: [{}]
        };
    },
    created() {
        this.projectId = this.$route.params.projectId;
        this.getTasks();
    },
    methods: {
        async getTasks() {
            this.projectId = this.$route.params.projectId;
            try {
                const data = await getAllTasksByProjectId(this.projectId);
                this.tasks = data;
                console.log(this.tasks);
            } catch (error) {
                console.error('Error fetchimg tasks:', error);
            }
        },
        demoViewMode(viewMode) {
            this.mode = viewMode;
        },
        getUserNames(data) {
            const responsibleUsers = data.users;
            if (responsibleUsers && responsibleUsers.length > 0) {
                const totalLength = responsibleUsers.join(', ').length;

                if (totalLength > 30) {
                    return responsibleUsers.join(', ').slice(0, 30) + '..';
                } else {
                    return responsibleUsers.join(', ');
                }
            } else {
                return '';
            }
        },
        exportPDF() {
            const doc = new jsPDF();

            const element = document.getElementById('svg');
            const { width, height } = element.getBBox();
            doc.svg(element, {
                x:0,
                y:0,
                width:width,
                height:height
            }).then(() => {
                doc.save('gantt.pdf');
            });
        }
    }
};
</script>

<style>
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
</style>