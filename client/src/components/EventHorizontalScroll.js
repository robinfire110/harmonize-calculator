import React, { useEffect, useRef, useState } from 'react'
import HorizontalScrollButton from "../components/HorizontalScrollButton";
import { Col } from 'react-bootstrap';
import EventCard from './EventCard';

function EventHorizontalScroll({data, persistantArrows=false}) {
    const [isScrolling, setIsScrolling] = useState(false);
    const [isOverflow, setIsOverflow] = useState(false);
    const [deviceType, setDeviceType] = useState("browser");
    const [arrowColor, setArrowColor] = useState({right: "blue", left: "disabled"})


    //Use effect
    useEffect(() => {
        updateOverflow();

        //Set update style
        window.addEventListener("resize", updateOverflow); 
    }, [])

    //Nav buttons
    const navRef = useRef();
    function handleNav(dir)
    {
        if (!isScrolling)
        {
            const scrollAmount = 550;
            setIsScrolling(true);
            if (navRef)
            {
                //Check for max
                const maxScrollRight = navRef.current.scrollWidth - navRef.current.clientWidth;
                const minScrollLeft = 0;
                setArrowColor({right: "blue", left: "blue"});

                if (dir == "left")
                {
                    if (navRef.current.scrollLeft - scrollAmount <= minScrollLeft) setArrowColor({right: "blue", left: "disabled"});
                    navRef.current.scrollLeft -= scrollAmount;
                } 
                else
                {
                    if (navRef.current.scrollLeft + scrollAmount >= maxScrollRight) setArrowColor({right: "disabled", left: "blue"});
                    navRef.current.scrollLeft += scrollAmount;
                } 

                //Reset is scrolling
                setTimeout(() => {
                    setIsScrolling(false);
                }, 325);
            }
        }
    }
    
    //Update overflow
    function updateOverflow()
    {
        updateStyle();
        if (navRef && navRef.current?.scrollWidth != null)
        {
            setIsOverflow(navRef.current.scrollWidth > navRef.current.clientWidth);
        }
        
    }

    //Update style based on width
    function updateStyle()
    {
        if (window.innerWidth >= 992) setDeviceType("browser");
        else setDeviceType("mobile");
    }

    //Layout
    function getLayout()
    {
        if (deviceType == "browser")
        {
            return (
                <>
                <HorizontalScrollButton dir="left" visible={isOverflow} onClick={() => handleNav("left")} persistantArrows={persistantArrows} color={arrowColor.left}/>
                <div style={{display: "flex", flexWrap: "nowrap", overflowX: "hidden", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth"}} ref={navRef}>
                    {data && data.map(event => {
                        return (<Col key={event.event_id} style={{flex: "0 0 auto"}}><EventCard eventId={event.event_id}/></Col>)
                    })
                    }
                </div>
                <HorizontalScrollButton dir="right" visible={isOverflow} onClick={() => handleNav("right")} persistantArrows={persistantArrows} color={arrowColor.right}/>
                </>
            );
        }
        else if (deviceType == "mobile")
        {
            return (
                <>
                <div style={{display: "flex", flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollBehavior: "smooth"}} ref={navRef}>
                    {data && data.map(event => {
                        return (<Col key={event.event_id} style={{flex: "0 0 auto"}}><EventCard eventId={event.event_id}/></Col>)
                    })
                    }
                </div>
                </>
            );
        }
    }

    return (
        <div style={{display: "flex", flexDirection: "row"}}>
            {getLayout()}
        </div>
    )
}

export default EventHorizontalScroll