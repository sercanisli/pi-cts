const Auth = {
    isAuthenticated() {
      const accessToken = localStorage.getItem('accessToken');
      return accessToken !== null;
    },

    isUserHavePermission(){
      const userPermissionsStr = localStorage.getItem('userPermissions');
      if (!userPermissionsStr){
        return [];
      } 
      
      const userPermissions = userPermissionsStr.split(',').map(permission => permission.trim());
      return userPermissions;
    }
  };
  



  export default Auth;