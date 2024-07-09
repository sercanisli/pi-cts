<template>
    <div>
        <svg ref="gantt" />
    </div>
</template>

<script>
import Gantt from 'frappe-gantt';
import 'frappe-gantt/dist/frappe-gantt.css';

export default {
    name: 'FrappeGantt',
    props: {
        viewMode: {
            type: String,
            required: false,
            default: 'Day'
        },
        tasks: {
            type: Array,
            required: true,
            default: []
        }
    },
    data () {
        return {
            gantt: {},
        };
    },
    watch: {
        viewMode () {
            this.updateViewMode();
        },

        tasks () {
            this.updateTasks();
        }
    },
    mounted () {
        this.setupGanttChart();
    },
    methods: {
        setupGanttChart () {
            this.gantt = new Gantt(this.$refs.gantt, this.tasks, {
                on_click: task => {
                    this.$emit('task-updated', task);
                },

                on_date_change: (task, start, end) => {
                    this.$emit('task-date-updated', { task, start, end });
                },

                on_progress_change: (task, progress) => {
                    this.$emit('task-progress-updated', { task, progress });
                },

                on_view_change: (mode) => {
                    this.$emit('view-mode-updated', mode);
                },
                // custom_popup_html : function(task) {
                //     return `
                //         <div class="details-container">
                //             <h5 class="taskName">${task.name}</h5>
                //             <p>Task started on: ${task._start.getDate()}</p>
                //             <p>Expected to finish by ${task._end.getDate()}</p>
                //             <p>${task.progress}% completed!</p>
                //             <span>
                //             </span>
                //         </div>
                //         `;
                // }
            });

            this.updateTasks();
            this.updateViewMode();
        },

        updateViewMode () {
            this.gantt.change_view_mode(this.viewMode[0].toUpperCase() + this.viewMode.substring(1));
        },

        updateTasks () {
            this.gantt.refresh(this.tasks);
        }
    }
};
</script>

<style lang="scss">
// .gantt-container .popup-wrapper {
//     width: 200px !important;
//     padding: 0 5px;
// }

// .taskName{
//     color: white;
// }

</style>