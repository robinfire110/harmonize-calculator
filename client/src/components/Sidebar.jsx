import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { Nav, Navbar } from 'react-bootstrap';
import '../App.css';

function Sidebar({ handleLinkClick, isAdmin }) {
    //States
    const [deviceType, setDeviceType] = useState("browser");
    const [sidebarOrientation, setSidebarOrientation] = useState("sidebar-vertical");
    const [currentTab, setCurrentTab] = useState(window.location.hash ? (window.location.hash).replace("#", "") : "listings");

    //Use effect
    useEffect(() => {
        updateStyle();

        //Redirect to correct one
        if (currentTab)
        {
            handleLinkClick(currentTab);
        }

        //Set update style
        window.addEventListener("resize", updateStyle); 
    }, [])

    //Update hash
    useEffect(() => {
        setCurrentTab(window.location.hash);
    }, [window.location.hash]);

    //Update overflow
    function updateStyle()
    {
        if (window.innerWidth >= 992)
        {
            setDeviceType("browser"); 
            setSidebarOrientation("sidebar-vertical");
        } 
        else
        {
            setDeviceType("mobile");
            setSidebarOrientation("sidebar");
        } 
    }

    return (
        <>
        {deviceType === "browser" && 
            <Navbar className="">
                <Nav variant='underline' className={`${sidebarOrientation}`} activeKey={(window.location.hash).replace("#", "")}>
                    <Nav.Link
                        onClick={() => handleLinkClick('calculations')}
                        href="/account#calculations"
                        eventKey={"calculations"}
                        >Calculations</Nav.Link>
                    <Nav.Link
                        onClick={() => handleLinkClick('profile')}
                        href="/account#profile"
                        eventKey={"profile"}
                        >Profile</Nav.Link>
                    {isAdmin && (
                        <Nav.Link
                            onClick={() => handleLinkClick('admin')}
                            href="/account#admin"
                            eventKey={"admin"}
                        >
                            Admin
                        </Nav.Link>
                    )}
                </Nav>
            </Navbar>
        }
        {deviceType === "mobile" &&
        <>
        <Nav variant='underline' className={`${sidebarOrientation}`} activeKey={(window.location.hash).replace("#", "")}>
            <Nav.Item>
                <Nav.Link className='px-3' eventKey="calculations" style={{color: "black", textDecoration: "none"}}
                    onClick={() => handleLinkClick('calculations')}
                    href="/account#calculations"
                    >Calculations
                </Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link className='px-3' eventKey="profile" style={{color: "black", textDecoration: "none"}}
                    onClick={() => handleLinkClick('profile')}
                    href="/account#profile"
                >Profile
                </Nav.Link>
            </Nav.Item>
            {isAdmin && (
                <Nav.Item>
                    <Nav.Link className='px-3' eventKey="admin" style={{color: "black", textDecoration: "none"}}
                        onClick={() => handleLinkClick('admin')}
                        href="account#admin"
                    >Admin
                    </Nav.Link>
            </Nav.Item>
            )}
        </Nav>
        <hr />
        </>
        }
        </>
    );
}

export default Sidebar;


