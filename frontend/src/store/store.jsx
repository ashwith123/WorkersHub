import {create} from 'zustand';
import axios from 'axios';

const useAuthStore=create((set)=>({

     user :null,
     loading:false,

    setuser(newUser){
        set({
            user:newUser
        })
    },

   login: async(formData)=>{

    try{

        set({
            loading:true,
            error:null
        });

        const res = await axios.post(
            "http://localhost:3000/api/auth/login",
            formData,
            {
                withCredentials:true
            }
        );

        set({
            user:res.data.user
        });

        return true;

    }
    catch(err){

        set({
            error:
                err.response?.data?.message ||
                "Login failed"
        });

        return false;

    }
    finally{

        set({
            loading:false
        });

    }

},

    checkAuth:async()=>{
        
        set({loading:true});

        try{
        let user = await axios.get("http://localhost:3000/api/auth/me", { withCredentials: true });
        set({ user: user.data });
        } catch (error) {
            console.error("Error checking authentication:", error);
        } finally {
            set({ loading: false });
        }


    },

    logout: async()=>{

    await axios.post(
       "http://localhost:3000/api/auth/logout",
       {},
       {
          withCredentials:true
       }
    );

    set({
       user:null
    });

    }



}));


export default useAuthStore ;