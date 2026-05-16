import { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";

function ListingsPage() {

    const navigate = useNavigate();
    const [allListings, setAllListings] = useState([]);

    useEffect(() => {

        const fetchListings = async() => {

            try {

                const res = await axios.get(
                    "http://localhost:3000/listings",
                    {
                        withCredentials:true
                    }
                );

                console.log(res.data);

                setAllListings(res.data);

            } catch(err) {

                console.log(err);

                navigate("/login");

            }

        };

        fetchListings();

    }, []);

    return (

        <div>

            <div className="profile-page-title">

                <h1>
                    Available Works
                </h1>

                <p>
                    Browse and apply for jobs near you
                </p>

            </div>

            <div className="listing-container">

                {allListings.map((listing) => (

                    <Link
                        to={`/listings/${listing._id}`}
                        className="card-link"
                        key={listing._id}
                    >

                        <div className="listing-card">

                            <img
                                src={
                                    listing.image
                                        ? listing.image.url
                                        : "https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?q=80&w=1587&auto=format&fit=crop"
                                }
                                alt="image"
                            />

                            <div className="card-body">

                                <p>

                                    <b>
                                        {listing.title}
                                    </b>

                                    <br />
{/* changes required here  */}
                                    {/* {listing.city},
                                    {" "}
                                    {listing.location.state} */}

                                    <br />

                                    ₹{listing.wagePerDay}

                                    <br />

                                    {listing.description.substring(0,100)}

                                </p>

                            </div>

                        </div>

                    </Link>

                ))}

            </div>

        </div>

    );

}

export default ListingsPage;