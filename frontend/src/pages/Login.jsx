import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/store";
import { Link } from "react-router-dom";

function Login() {

    const navigate = useNavigate();
    const login = useAuthStore(
        (state)=>state.login
    );

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async(e) => {

        e.preventDefault();

        console.log(formData);

        let sucess=await login(formData);

        if(sucess){
            navigate("/listings");
        }

    };

    return (
        <div>

            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <button type="submit">
                    Login
                </button>

            </form>

            <h1>click here to <Link to="/signup">signup</Link></h1>

        </div>
    );
}

export default Login;