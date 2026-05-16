import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: ""
    });

    function handleChange(e) {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    }

   async function handleSubmit(e) {

    e.preventDefault();

 
    try {

        const updatedFormData = {
            ...formData,
            role: formData.role.toUpperCase()
        };

        console.log(updatedFormData);

        const res = await axios.post(
            "http://localhost:3000/api/auth/signup",
            updatedFormData,
            {
                withCredentials: true
            }
        );

        console.log(res.data);

        if (res.data.success) {
            navigate("/");
        }

    } catch (err) {

        console.log(err.response);

        setError(
            err.response?.data?.message || "Signup failed"
        );

    }

}

    return (
        <div>

            <h1>Sign up</h1>
 

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <br /><br />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <br /><br />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >

                    <option value="">
                        Select Role
                    </option>

                    <option value="WORKER">
                        Worker
                    </option>

                    <option value="BUILDER">
                        Builder
                    </option>

                </select>

                <br /><br />

                <button type="submit">
                    Signup
                </button>

            </form>

        </div>
    );
}

export default Signup;