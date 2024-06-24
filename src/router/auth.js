const Auth = {
    isAuthenticated() {
      const accessToken = localStorage.getItem('accessToken');
      console.log(accessToken)
      if(accessToken){
        return true;
      } else {
        return false;
      }
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