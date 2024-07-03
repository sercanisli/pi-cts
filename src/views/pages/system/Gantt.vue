<template>          
  <div>
    <h1>Gantt Grafiği</h1>
    <gantt-chart :tasks="tasks" :arrows="arrows"></gantt-chart>
  </div>
</template>

<script>
import GanttChart from '../../../components/GanttChart.vue';

export default {
  name: 'App',
  components: {
    GanttChart,
  },
  data() {
    return {
      tasks: [
        {
          id: 'Task 1',
          name: 'Task 1',
          start: '2024-06-25',
          end: '2024-07-05',
          progress: 50,
        },
        {
          id: 'Task 2',
          name: 'Task 2',
          start: '2024-07-01',
          end: '2024-07-10',
          progress: 30,
          dependencies:[
            'Task 1'
          ]
        },
        {
          id: 'Task 3',
          name: 'Task 3',
          start: '2024-07-05',
          end: '2024-07-10',
          progress: 30,
          dependencies:[
            'Task 1',
            'Task 2'
          ]
        },
        {
          id: 'Task 4',
          name: 'Task 4',
          start: '2024-07-01',
          end: '2024-07-10',
          progress: 30,
          dependencies:[
            'Task 1'
          ]
        },
        {
          id: 'Task 5',
          name: 'Task 5',
          start: '2024-07-11',
          end: '2024-07-15',
          progress: 30,
          dependencies:[
            'Task 4'
          ]
        },
        {
          id: 'Task 6',
          name: 'Task 6',
          start: '2024-07-11',
          end: '2024-07-15',
          progress: 30,
          dependencies:[
            'Task 2',
            'Task 3',
            'Task 4'
          ]
        },
        {
          id: 'Task 7',
          name: 'Task 7',
          start: '2024-07-11',
          end: '2024-07-15',
          progress: 30,
          dependencies:[
            'Task 1'
          ]
        },
      ],
      arrows: [
        {
          id: 'arrow1',
          source: 'Task 1',
          target: 'Task 2',
        },
      ],
      id:null
    };
  },
  created(){
  }
};
</script>

<style>
</style>
