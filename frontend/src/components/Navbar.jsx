import { Link } from "react-router-dom";
import useAuthStore from "../store/store";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function Navbar() {

    const navigate = useNavigate();

    const user = useAuthStore(
     (state)=>state.user
    );
    const logout = useAuthStore(
        (state)=>state.logout
    );

    let handeleLogout=async()=>{

        await logout();
        navigate("/login");

    
    };

    let handelsignup=()=>{

        navigate("/signup");
    };

    return (

        <nav className="navbar navbar-expand-md bg-body-light border-bottom sticky-top">

            <div className="container-fluid">

                <div
                    className="collapse navbar-collapse"
                    id="navbarId"
                >

                    <div className="navbar-nav">

                        <Link
                            className="nav-link"
                            to="/listings"
                        >

                            <div id="icon">
                                <i className="fa-solid fa-house"></i>
                                WorkersHub
                            </div>

                        </Link>

                    </div>

                    <div className="navbar-nav ms-auto">

                        {user ? (

                            <>

                                {user.role === "BUILDER" && (

                                    <Link
                                        to="/listings/add"
                                        className="nav-link"
                                    >
                                        Add New Listing
                                    </Link>

                                )}

                                <Link
                                    className="nav-link"
                                    to="/profile"
                                >
                                    Profile
                                </Link>

                                <Link
                                    className="nav-link"
                                    onClick={handeleLogout}
                                >
                                    Logout
                                </Link>

                            </>

                        ) : (

                            <>
 

                            </>

                        )}

                    </div>

                </div>

            </div>

        </nav>

    );

}

export default Navbar;