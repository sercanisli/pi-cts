<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Şirket</span>
            <div class="text-900 font-medium text-xl">
              Şirket Sayısı : {{ companiesCount }}
            </div>
          </div>
          <div
            class="flex align-items-center justify-content-center bg-blue-100 border-round"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-building text-blue-500 text-xl"></i>
          </div>
        </div>
        <!-- <span class="text-green-500 font-medium">24 new </span>
                <span class="text-500">since last visit</span> -->
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Şube</span>
            <div class="text-900 font-medium text-xl">
              Şube Sayısı : {{ branchesCount }}
            </div>
          </div>
          <div
            class="flex align-items-center justify-content-center bg-orange-100 border-round"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-sitemap text-orange-500 text-xl"></i>
          </div>
        </div>
        <!-- <span class="text-green-500 font-medium">%52+ </span>
                <span class="text-500">since last week</span> -->
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Kullanıcı</span>
            <div class="text-900 font-medium text-xl">
              Kullanıcı Sayısı : {{ usersCount }}
            </div>
          </div>
          <div
            class="flex align-items-center justify-content-center bg-cyan-100 border-round"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-user text-cyan-500 text-xl"></i>
          </div>
        </div>
        <!-- <span class="text-green-500 font-medium">520 </span>
                <span class="text-500">newly registered</span> -->
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-medium mb-3">Bağlantı</span>
            <div class="text-900 font-medium text-xl">
              Bağlantı Sayısı : {{ connectionsCount }}
            </div>
          </div>
          <div
            class="flex align-items-center justify-content-center bg-purple-100 border-round"
            style="width: 2.5rem; height: 2.5rem"
          >
            <i class="pi pi-link text-purple-500 text-xl"></i>
          </div>
        </div>
        <!-- <span class="text-green-500 font-medium">85 </span>
                <span class="text-500">responded</span> -->
      </div>
    </div>
    <div class="col-12 xl:col-12">
      <div class="card">
        <h5>Aylık Arama Verileri</h5>
        <Chart type="line" :data="chartData" :options="chartOptions" />
      </div>
    </div>
    <div class="col-12 xl:col-6">
      <div class="card">
        <h5>Şirket Başına Arama</h5>
        <Chart
          type="pie"
          :data="pieChartData"
          :options="pieChartOptions"
          class="w-full md:w-30rem"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getDashboardItemsCount } from '../service/fetch/dashboardApi';
import { getAllSearchCounts } from "../service/fetch/searchCountsApi";
import { getAllSearchCountsofCompanies } from "../service/fetch/searchCountsofCompaniesApi";

export default {
  data() {
    return {
      counts:[],
      searchCounts: [],
      searchCountsofCompanies: [],
      lineChartData: null,
      lineChartOptions: null,
      pieChartData: null,
      pieChartOptions: null,
    };
  },
  mounted() {
    this.chartOptions = this.lineSetChartOptions();
    this.pieSetChartOptions = this.pieSetChartOptions();
  },
  created() {
    this.getDashboardItemsCount();
    this.getAllSearchCounts();
    this.getAllSearchCountsofCompanies();
    setTimeout(() => {
      this.calculateCounts();
      this.chartData = this.lineSetChartData();
      this.pieChartData = this.pieSetChartData();
    }, 500);
  },
  methods: {
    getDashboardItemsCount(){
        getDashboardItemsCount()
        .then((data) => {
            this.counts = data;
        })
    },
    getAllSearchCounts() {
      getAllSearchCounts()
        .then((data) => {
          this.searchCounts = data;
        })
        .catch((error) => {
          console.error("Error fetching search counts", error);
        });
    },
    getAllSearchCountsofCompanies() {
      getAllSearchCountsofCompanies().then((data) => {
        this.searchCountsofCompanies = data;
      });
    },
    calculateCounts() {
      this.companiesCount = this.counts.companiesCount;
      this.branchesCount = this.counts.branchesCount;
      this.usersCount = this.counts.usersCount;
      this.connectionsCount = this.counts.connectionsCount;
    },
    lineSetChartData() {
      const documentStyle = getComputedStyle(document.documentElement);
      const months = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];
      const data = months.map((month, index) => {
        const monthData = this.searchCounts.find(
          (item) => item.dateofMonth === index + 1
        );
        return monthData ? monthData.count : 0;
      });

      return {
        labels: months,
        datasets: [
          {
            label: "Aylık Arama Sayısı",
            data: data,
            fill: false,
            borderColor: documentStyle.getPropertyValue("--cyan-500"),
            tension: 0.5,
          },
        ],
      };
    },
    lineSetChartOptions() {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue("--text-color");
      const textColorSecondary = documentStyle.getPropertyValue("--text-color-secondary");
      const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

      return {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
          legend: {
            labels: {
              color: textColor,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
          y: {
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
            },
          },
        },
      };
    },
    pieSetChartData() {
      const documentStyle = getComputedStyle(document.body);
      const labels = this.searchCountsofCompanies.map(
        (sccoc) => sccoc.companyCompanyName
      );
      const data = this.searchCountsofCompanies.map((sccoc) => sccoc.count);

      return {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              documentStyle.getPropertyValue("--cyan-500"),
              documentStyle.getPropertyValue("--orange-500"),
              documentStyle.getPropertyValue("--gray-500"),
              documentStyle.getPropertyValue("--green-500"),
              documentStyle.getPropertyValue("--purple-500"),
              documentStyle.getPropertyValue("--yellow-500"),
              documentStyle.getPropertyValue("--red-500"),
              documentStyle.getPropertyValue("--blue-500"),
              documentStyle.getPropertyValue("--pink-500"),
              documentStyle.getPropertyValue("--indigo-500"),
              documentStyle.getPropertyValue("--teal-500"),
              documentStyle.getPropertyValue("--bluegray-500"),
              documentStyle.getPropertyValue("--primary-500"),
              documentStyle.getPropertyValue("--surface-50"),
            ],
          },
        ],
      };
    },
    pieSetChartOptions() {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue("--text-color");

      return {
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
              color: textColor,
            },
          },
        },
      };
    },
  },
};
</script>

<style></style>
