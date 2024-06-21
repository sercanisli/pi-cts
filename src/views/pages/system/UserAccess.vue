<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div v-if="user" class="my-2">
                            <h6>
                                Seçili Kullanıcı: <span>{{ user.firstName }} {{ user.lastName }} </span>
                            </h6>
                        </div>
                    </template>
                </Toolbar>
                <Toolbar class="mb-4" style="display: flex; justify-content: flex-start; align-items: center">
                    <template v-slot:start>
                        <div class="my-2" style="display: flex; align-items: center">
                            <Button label="Erişim Yetkileri" icon="pi pi-key" class="mr-2" @click="toggleAccess" />
                        </div>
                    </template>
                    <template v-slot:end>
                        <Button label="Şirket Yetkileri" icon="pi pi-building" class="mr-2" @click="toggleBranchAccess" />
                    </template>
                </Toolbar>
                <div v-if="showAccess" class="my-2">
                    <div class="grid">
                        <div class="col-12">
                            <div class="card">
                                <h5>Erişim Yetkileri</h5>
                                <Tree :value="root" selectionMode="checkbox" v-model:selectionKeys="selectedTreeValue" class="w-full md:w-30rem"></Tree>
                            </div>
                        </div>
                    </div>
                    <div class="my-2">
                        <Button label="Kaydet" icon="pi pi-check" severity="success" class="mb-2 mr-2" @click.prevent="saveClickPermissions" />
                    </div>
                </div>
                <div v-if="showBranchAccess" class="my-2">
                    <div class="grid">
                        <div class="col-12">
                            <div class="card">
                                <h5>Şirket Yetkileri</h5>
                                <Tree :value="branchesRoot" selectionMode="checkbox" v-model:selectionKeys="selectedBranchTreeValue" class="w-full md:w-30rem"></Tree>
                            </div>
                        </div>
                    </div>
                    <div class="my-2">
                        <Button label="Kaydet" icon="pi pi-check" severity="success" class="mb-2 mr-2" @click.prevent="saveClickBranches" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getOneUserById } from '../../../service/fetch/usersApi';
import { getAllUserRoles, updateUserRole } from '../../../service/fetch/userRolesApi';
import { getAllMainRoots } from '../../../service/fetch/mainRootApi';
import { getAllUserBranches, updateUserBranches } from '../../../service/fetch/userBranchesApi';
import { getAllBranchMainRoots } from '../../../service/fetch/branchMainRootsApi';
import Tree from 'primevue/tree';
export default {
    components: {
        Tree
    },
    data() {
        return {
            id: null,
            user: null,
            users: [],
            roles: [],
            treeValue: null,
            selectedTreeValue: {},
            selectedBranchTreeValue: {},
            showAccess: true,
            showBranchAccess: false,
            keys: [],
            treeValue: null,
            root: [],
            userBranches: [],
            branchesRoot: []
        };
    },
    async created() {
        this.id = this.$route.params.userId;
        this.getAllMainRoots();
        await this.getAllUserRoles(this.id);
        await this.getUser();
        await this.getAllUserBranches(this.id);
    },
    methods: {
        async getAllUserRoles(id) {
            await getAllUserRoles(id)
                .then((data) => {
                    this.roles = data;
                }).then(() => {
                    this.updatePermissions();
                })
                .catch((error) => {
                    console.error('Error fetching users', error);
                });
        },
        async getUser() {
            this.user = await getOneUserById(this.id);
        },
        async getAllUserBranches(id) {
            await getAllUserBranches(id)
                .then((data) => {
                    this.userBranches = data;
                }).then(() => {
                    this.getAllBranchMainRoots();
                })
                .catch((error) => {
                    console.error('Error fetching user branches', error);
                });
        },
        async getAllMainRoots() {
            getAllMainRoots()
                .then((data) => {
                    this.root = data;
                })
                .catch((error) => {
                    console.error('Error fetching main roots', error);
                });
        },
        async getAllBranchMainRoots() {
            getAllBranchMainRoots()
                .then((data) => {
                    this.branchesRoot = data;
                })
                .catch((error) => {
                    console.error('Error fetching branches main roots', error);
                });
        },
        async saveClickPermissions() {
            const userId = this.id;
            const selectedRoles = [];
            this.root.forEach((node) => {
                node.children.forEach((child) => {
                    if (this.selectedTreeValue[child.key] && this.selectedTreeValue[child.key].checked) {
                        selectedRoles.push(child.label);
                    }
                });
            });
            try {
                const newRoles = {
                    id: userId,
                    roles: selectedRoles
                };
                const response = await updateUserRole(newRoles);
                if (response === 204) {
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Roles Updated',
                        life: 3000
                    });
                    this.getAllUserRoles();
                }
            } catch (error) {
                console.error('Error updating user role:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update user role',
                    life: 3000
                });
            }
        },
        async saveClickBranches() {
            const userId = this.id;
            const selectedBranches = [];
            const newUserBranchesArray = [];
            this.branchesRoot.forEach((node) => {
                node.children.forEach((child) => {
                    if (this.selectedBranchTreeValue[child.key] && this.selectedBranchTreeValue[child.key].checked) {
                        selectedBranches.push(child.id);
                    }
                });
            });
            try {
                selectedBranches.forEach((selectedBranch) => {
                    const newUserBranch = {
                        userId: this.id,
                        branchId: selectedBranch
                    };
                    newUserBranchesArray.push(newUserBranch);
                });
                const response = await updateUserBranches(userId, newUserBranchesArray);
                if (response === 204) {
                    this.$toast.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'User Branches Updated',
                        life: 3000
                    });
                    this.getAllUserBranches();
                }
            } catch (error) {
                console.error('Error updating user branches:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update user branches',
                    life: 3000
                });
            }
        },
        toggleAccess() {
            this.showAccess = !this.showAccess;
            if (this.showAccess) {
                this.showBranchAccess = false;
            }
        },
        toggleBranchAccess() {
            this.updateBranches();
            this.showBranchAccess = !this.showBranchAccess;
            if (this.showBranchAccess) {
                this.showAccess = false;
            }
        },
        updatePermissions() {
            this.root.forEach((node) => {
                let allChildrenSelected = true;
                let anyChildSelected = false;
                let allChildrenUnchecked = true;
                node.children.forEach((child) => {
                    let found = false;
                    this.roles.forEach((role) => {
                        if (role.name === child.label) {
                            found = true;
                            if (this.selectedTreeValue[child.key]) {
                                this.selectedTreeValue[child.key].checked = true;
                                this.selectedTreeValue[child.key].partialChecked = false;
                            } else {
                                this.selectedTreeValue[child.key] = {
                                    checked: true,
                                    partialChecked: false
                                };
                            }
                        }
                    });
                    if (!found) {
                        allChildrenSelected = false;
                        allChildrenUnchecked = false;
                    } else {
                        anyChildSelected = true;
                        allChildrenUnchecked = false;
                    }
                });
                if (allChildrenSelected) {
                    this.selectedTreeValue[node.key] = { checked: true, partialChecked: false };
                } else if (anyChildSelected && !allChildrenUnchecked) {
                    this.selectedTreeValue[node.key] = { checked: false, partialChecked: true };
                } else {
                    this.selectedTreeValue[node.key] = { checked: false, partialChecked: false };
                }
            });
            this.$forceUpdate();
        },
        updateBranches() {
            this.branchesRoot.forEach((node) => {
                let allChildrenSelected = true;
                let anyChildSelected = false;
                let allChildrenUnchecked = true;
                node.children.forEach((child) => {
                    let found = false;
                    this.userBranches.forEach((userBranch) => {
                        if (userBranch.branchCompanyCompanyName === node.label && userBranch.branchBranchName === child.label) {
                            found = true;
                            if (this.selectedBranchTreeValue[child.key]) {
                                this.selectedBranchTreeValue[child.key].checked = true;
                                this.selectedBranchTreeValue[child.key].partialChecked = false;
                            } else {
                                this.selectedBranchTreeValue[child.key] = {
                                    checked: true,
                                    partialChecked: false
                                };
                            }
                        }
                    });
                    if (!found) {
                        allChildrenSelected = false;
                        allChildrenUnchecked = false;
                    } else {
                        anyChildSelected = true;
                        allChildrenUnchecked = false;
                    }
                });
                if (allChildrenSelected) {
                    this.selectedBranchTreeValue[node.key] = { checked: true, partialChecked: false };
                } else if (anyChildSelected && !allChildrenUnchecked) {
                    this.selectedBranchTreeValue[node.key] = { checked: false, partialChecked: true };
                } else {
                    this.selectedBranchTreeValue[node.key] = { checked: false, partialChecked: false };
                }
            });
            this.$forceUpdate();
        }
    },
    watch: {
        selectedTreeValue: function (newVal, oldVal) {}
    }
};
</script>
