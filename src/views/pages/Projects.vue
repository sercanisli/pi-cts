<template>
    <div class="grid">
        <div class="col-12">
            <div class="card ">
                <Toolbar class="mb-4">
                   <template v-slot:end>
                       <IconField iconPosition="left" class="block mt-2 md:mt-0">
                               <InputIcon class="pi pi-search" />
                               <InputText v-model="globalFilter" class="w-full sm:w-auto"/>
                           </IconField>
                   </template>
               </Toolbar>
               <div class="col-12 projectsDiv">
                    <div class="card cardDiv">
                        <div class="grid grid-cols-3 md:grid-cols-6 sm:grid-cols-12 justify-content-center gridDiv">
                            <div v-for="(item, index) in displayedCards" :key="index">
                                <Card style=" overflow: hidden" class="clickableDiv" @click="goToTasks(item)">
                                    <template #title>{{item.projectName}}</template>
                                    <template #subtitle>{{item.companyCompanyName}}</template>
                                    <template #content>
                                        <p class="m-0">
                                            Başlama Tarihi : {{getDate(item.startDate)}}
                                        </p>
                                        <p class="m-0">
                                            Bitiş Tarihi : {{getDate(item.endDate)}}
                                        </p>
                                        <p class="m-0">
                                            {{item.description}}
                                        </p>
                                        <p class="m-0">
                                            Proje durumu : {{item.statusName}}
                                        </p>
                                    </template>
                                </Card>
                            </div>
                        </div>
                        <div class="mt-5">
                            <Paginator v-model:currentPage="currentPage" :totalRecords="projects.length" :rows="itemsPerPage" :rowsPerPageOptions="[4, 8, 24, 48]" @page="onPage($event)" />
                        </div>
                    </div>
               </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAllProjects } from '../../service/fetch/projectsApi';
import { getAllTasksByProjectId } from '../../service/fetch/tasksApi';

export default {
    data(){
        return{
            projects:[],
            currentPage:0,
            itemsPerPage:12,
            displayedCards:[]
        }
    },
    created(){
        this.getProjects()
        .then(() => {
            this.updateDisplayedCards();
        })
    },
    methods:{
        async getProjects(){
            try {
                const data = await getAllProjects();
                this.projects = data;
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        },
        goToTasks(item){
            this.$router.push({name : 'projectTasks', params: { projectId: item.id } });
        },
        getDate(date){
            const newDate = new Date(date);
            const day = newDate.getDate();
            const month = newDate.getMonth() + 1; 
            const year = newDate.getFullYear();

            return `${day.toString()}/${month.toString()}/${year}`;
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
    }
}
</script>

<style>
.projectsDiv{
    padding: 0px !important;
}

.clickableDiv{
    cursor: pointer;
}
.cardDiv .clickableDiv {
    margin: 10px; /* İstenilen boşluk miktarını ayarlayabilirsiniz */
}

</style>