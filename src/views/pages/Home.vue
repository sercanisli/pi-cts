<template>
    <div class="grid">
        <div class="col-12">
            <div class="card ">
                <div class="dropdown-wrapper">
                    <Dropdown v-model="selectedCompany" :options="companies" optionLabel="companyName" :placeholder="'Şirket Seçiniz'" class="dropdownHome  md:w-14rem " @change="getBranchForDropdown" />
                    <Dropdown v-model="selectedBranch" :options="filteredBranches" optionLabel="branchName" :placeholder="'Şube Seçiniz'" class=" dropdownHome  md:w-14rem" />
                    <Button icon="pi pi-search" class="mr-2 buttonHome" label="Ara" rounded @click.prevent="handleClick" />
                </div>
                <div class="data-table">
                    <DataTable 
                        v-model:expandedRowGroups="expandedRowGroups"
                        data-key="id" 
                        :value="filteredConnections" 
                        stripedRows 
                        expandableRowGroups
                        rowGroupMode="subheader"
                        groupRowsBy="branchId"
                        paginator 
                        :rows="20" 
                        :rowsPerPageOptions="[5, 10, 20, 50]" 
                        tableStyle="min-width: 50rem"
                    >
                        <template #header>
                            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                <h5 class="m-0">Bağlantılar</h5>
                            </div>
                        </template>
                        <template #groupheader="slotProps">
                            <span class="vertical-align-middle ml-2 font-bold line-height-3">{{ slotProps.data.branchBranchName }}</span>
                        </template>
                        <Column field="companyId" header="Şirket Adı" style="width: 10%">
                            <template #body="slotProps">
                                <span v-if="slotProps.data.branchCompanyId">
                                    {{ slotProps.data.branchCompanyCompanyName }}
                                </span>
                            </template>
                        </Column>
                        <Column field="branchBranchName" header="Şube Adı" style="width: 10%">
                            <template #body="slotProps">
                                <span v-if="slotProps.data.branchBranchName">
                                    {{ slotProps.data.branchBranchName }}
                                </span>
                            </template>
                        </Column>
                        <Column field="connectionType" header="Bağlantı Türü" style="width: 10%">
                            <template #body="slotProps">
                                <span v-if="slotProps.data.connectionTypeId">
                                    {{ slotProps.data.connectionTypeType }}
                                </span>
                            </template>
                        </Column>
                        <Column field="link" header="Bağlantı" style="width: 15%"></Column>
                        <Column field="username" header="Kullanıcı Adı" style="width: 10%"></Column>
                        <Column field="password" header="Şifre" style="width: 10%"></Column>
                        <Column field="description" header="Açıklama" style="width: 15%">
                            <template #body="slotProps">
                                <span v-if="slotProps.data.description" v-tooltip.top="slotProps.data.description"> {{ slotProps.data.description.slice(0, 20) }}{{ slotProps.data.description.length > 20 ? '...' : '' }} </span>
                                <div v-if="slotProps.data.description">
                                    <i @click.prevent="handleDescription(slotProps.data)" class="pi pi-arrows-alt" style="font-size: 1rem; cursor: pointer"></i>
                                </div>
                            </template>
                        </Column>
                        <Column field="branchBranchName" header="Yetkili" style="width: 5%">
                            <template #body="slotProps">
                                <div v-if="slotProps.data.branchPersons && slotProps.data.branchPersons.length > 0 ">
                                    <Button icon="pi pi-eye" class="mr-2" text rounded @click="authorizedPerson(slotProps.data)" />
                                </div>
                                <div v-else class="button-eye">
                                    <Button icon="pi pi-eye-slash" class="mr-2" disabled text rounded @click="authorizedPerson(slotProps.data)" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <Dialog v-model:visible="dialogDescription" :style="{ width: '400px' }" header="Açıklama" :modal="true" class="p-fluid">
                        <p>{{ description }}</p>
                        <Button label="Cancel" icon="pi pi-times" text="" class="dialog-button" @click.prevent="cancelClick" />
                    </Dialog>
                    <Dialog v-model:visible="dialogAuthorizedPerson" :style="{ width: '400px' }" header="Yetkili Kişiler" :modal="true" class="p-fluid">
                        <div v-for="(person, index) in authPerson" :key="index">
                            <div v-if="person" class="authperson-dialog">
                                <p>{{ person.fullName }}</p>
                                <p>{{ person.phone }}</p>
                            </div>
                            <div>
                                <hr />
                            </div>
                        </div>
                        <Button label="Cancel" icon="pi pi-times" text="" class="dialog-button" @click.prevent="cancelClick" />
                    </Dialog>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useToast } from 'primevue/usetoast';
import { getAllConnectionsByBranchId } from '../../service/fetch/connectionsApi';
import { updateSearchCount } from '../../service/fetch/searchCountsApi';
import { updateSearchCountsofCompanies } from '../../service/fetch/searchCountsofCompaniesApi';

export default {
    data() {
        return {
            companies: [],
            branches: [],
            persons: [],
            connections: [],
            connectionsDetails: [],
            connectionTypes: [],
            selectedConnection: null,
            selectedCompany: null,
            selectedBranch: null,
            selectedPerson: null,
            selectedConnectionType: null,
            filteredConnections: [],
            visible: '',
            dialogDescription: false,
            dialogAuthorizedPerson: false,
            expandedRowGroups: null,
            description: '',
            authPerson: [],
            tempSelectedCompany: null,
            tempSelectedBranch: null
        };
    },
    methods: {
        getAllConnectionsByBranchId() {
            getAllConnectionsByBranchId().then((data) => {
                this.connections = data;
                this.connections.forEach((detail) => {
                    let isUniqueCompanies = true;
                    this.companies.forEach((company) => {
                        if (company.companyId === detail.branchCompanyId && company.companyName === detail.branchCompanyCompanyName) {
                            isUniqueCompanies = false;
                        }
                    });
                    if (isUniqueCompanies) {
                        const company = {
                            companyId: detail.branchCompanyId,
                            companyName: detail.branchCompanyCompanyName
                        };
                        this.companies.push(company);
                    }

                    let isUniqueBranches = true;
                    this.branches.forEach((branch) => {
                        if (branch.branchId === detail.branchId && branch.branchName === detail.branchBranchName && branch.companyId === detail.branchCompanyId) {
                            isUniqueBranches = false;
                        }
                    });
                    if (isUniqueBranches) {
                        const branch = {
                            branchId: detail.branchId,
                            branchName: detail.branchBranchName,
                            companyId: detail.branchCompanyId
                        };
                        this.branches.push(branch);
                    }

                    let isUniqueConnectionType = true;
                    this.connectionTypes.forEach((cType) => {
                        if (cType.connectionTypeId === detail.connectionTypeId && cType.connectionTypeType === detail.connectionTypeType) {
                            isUniqueConnectionType = false;
                        }
                    });
                    if (isUniqueConnectionType) {
                        const connectionType = {
                            connectionTypeId: detail.connectionTypeId,
                            connectionType: detail.connectionTypeType
                        };
                        this.connectionTypes.push(connectionType);
                    }

                    detail.branchPersons.forEach((person) => {
                        let isUniquePerson = true;
                        this.persons.forEach((per) => {
                            if (per.fullName === person.fullName && per.phone === person.phone && per.branchId === person.branchId) {
                                isUniquePerson = false;
                            }
                        });
                        if (isUniquePerson) {
                            const personData = {
                                fullName: person.fullName,
                                phone: person.phone,
                                branchId: person.branchId
                            };
                            this.persons.push(personData);
                        }
                    });
                });
            });
        },
        handleClick() {
            if (this.selectedCompany === null) {
                this.selectedBranch = null;
                this.$toast.add({
                    severity: 'info',
                    summary: 'Info',
                    detail: 'Lütfen şirket seçimi yapınız.',
                    life: 4000
                });
            } else {
                if (this.selectedCompany && this.selectedBranch === null) {
                    const selectedCompanyId = this.selectedCompany ? this.selectedCompany.companyId : null;
                    this.filteredConnections = this.connections.filter((connection) => {
                        const connectionBranchId = connection.branchId;
                        const connectionCompanyId = this.getBranch(connectionBranchId).companyId;
                        if (selectedCompanyId && connectionCompanyId !== selectedCompanyId) {
                            return false;
                        }

                        return true;
                    });
                    if (this.filteredConnections.length === 0) {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Seçili şirket için bağlantı bulunamadı',
                            life: 4000
                        });
                    }
                } else if (this.selectedCompany && this.selectedBranch) {
                    const selectedCompanyId = this.selectedCompany ? this.selectedCompany.companyId : null;
                    const selectedBranchId = this.selectedBranch ? this.selectedBranch.branchId : null;

                    this.filteredConnections = this.connections.filter((connection) => {
                        const connectionBranchId = connection.branchId;
                        const connectionCompanyId = this.getBranch(connectionBranchId).companyId;

                        if (selectedCompanyId && connectionCompanyId !== selectedCompanyId) {
                            return false;
                        }

                        if (selectedBranchId && connectionBranchId !== selectedBranchId) {
                            return false;
                        }

                        return true;
                    });
                    if (this.filteredConnections.length === 0) {
                        this.$toast.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Seçili şube için bağlantı bulunamadı',
                            life: 4000
                        });
                    }
                }
                this.editSearchCount();
                this.editSearchCountsofCompanies();
            }
            // this.clearDropdowns();
        },
        async editSearchCount() {
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const newCount = {
                count: 1,
                dateofMonth: currentMonth
            };
            await updateSearchCount(newCount);
        },
        async editSearchCountsofCompanies() {
            const companyId = this.selectedCompany.companyId;
            const newSearchCountsofCompany = {
                count: 1,
                companyId: companyId
            };
            await updateSearchCountsofCompanies(newSearchCountsofCompany);
        },
        cancelClick() {
            this.dialogDescription = false;
            this.dialogAuthorizedPerson = false;
        },
        // clearDropdowns() {
        //     this.selectedCompany = null;
        //     this.selectedBranch = null;
        // },
        authorizedPerson(data) {
            const branchId = data.branchId;
            const branchPersons = this.persons.filter((person) => person.branchId === branchId);
            this.authPerson = branchPersons;
            this.dialogAuthorizedPerson = true;
        },
        getBranchForDropdown() {
            this.selectedBranch = null;
            const selectedCompanyId = this.selectedCompany.companyId;
            const filteredBranches = [];

            this.branches.forEach((branch) => {
                if (branch.companyId === selectedCompanyId) {
                    filteredBranches.push(branch);
                }
            });
            this.filteredBranches = filteredBranches;
        },
        getBranch(branchId) {
            return this.branches.find((branch) => branch.branchId === branchId);
        },
        getBranchName(branchId) {
            const branch = this.getBranch(branchId);
            return branch ? branch.branchName : '';
        },
        getCompanyName(branchId) {
            const branch = this.getBranch(branchId);
            if (!branch) {
                return '';
            }

            const company = this.companies.find((company) => company.id === branch.companyId);
            return company ? company.companyName : '';
        },
        getPersonName(branchId) {
            const person = this.persons.find((person) => person.branchId === branchId);

            return person ? person.fullname : '';
        },
        getPersonPhone(branchId) {
            const person = this.persons.find((person) => person.branchId === branchId);

            return person ? person.phone : '';
        },
        getConnectionType(connectionTypeId) {
            return this.connectionTypes.find((ct) => ct.id === connectionTypeId);
        },
        getConnectionTypeName(connectionTypeId) {
            const connectionType = this.getConnectionType(connectionTypeId);
            return connectionType ? connectionType.type : '';
        },
        getCompanyNameByCompanyId(companyId) {
            const company = this.companies.find((company) => company.id === companyId);
            return company ? company.companyName : '';
        },
        handleDescription(data) {
            this.description = data.description;
            this.dialogDescription = true;
        }
    },
    mounted() {
        const toast = useToast();

        this.getAllConnectionsByBranchId();
    }
};
</script>

<style>
.dropdown-wrapper {
    justify-content: start !important;
    margin: 30px !important;
}

.dropdownHome {
    margin: 15px !important;
}

.buttonHome {
    margin: 15px ;
    width: 75px;
}
.data-table {
    margin-top: 25px;
}

.button-eye .p-button {
    color: red;
}

.dialog-button {
    justify-content: end;
    width: 100px;
}

.authperson-dialog {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100% !important;
}

.authperson-dialog p {
    margin: 5px 0;
}

.authperson-dialog p:nth-child(odd) {
    text-align: right;
}

.authperson-dialog p:nth-child(even) {
    text-align: left;
}
</style>
