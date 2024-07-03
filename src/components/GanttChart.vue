<template>
  <div>
    <div ref="gantt"></div>
  </div>
</template>

<script>
import Gantt from 'frappe-gantt';
import 'frappe-gantt/dist/frappe-gantt.css';

export default {
  name: 'GanttChart',
  props: {
    tasks: Array,
    arrows: Array,
  },
  mounted() {
    this.renderGantt();
  },
  methods: {
    renderGantt() {
      const gantt = new Gantt(this.$refs.gantt, this.tasks, {
        on_click: task => {
          console.log(task);
        },
        on_date_change: (task, start, end) => {
          console.log(task, start, end);
        },
        on_progress_change: (task, progress) => {
          console.log(task, progress);
        },
        on_view_change: gantt => {
          console.log(gantt);
        }
      });

      if (this.arrows) {
        this.arrows.forEach(arrow => {
          gantt.addArrow(arrow);
        });
      }
    },
  },
};
</script>

<style scoped>
</style>
