import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons'

function HorizontalScrollButton({dir, onClick, visible=true, persistantArrows=false, color="blue"}) {
    //Functions
    //Set Color
    if (color == "disabled") color = "rgba(0,0,0,.35)";

    function getIcon(dir)
    {
        if (!visible && persistantArrows) return (<FontAwesomeIcon icon={faChevronLeft} size="2x" style={{color: "rgba(0,0,0,0)"}}/>);
        else if (dir == "left") return (<FontAwesomeIcon icon={faChevronLeft} size="2x"/>);
        else return (<FontAwesomeIcon icon={faChevronRight} size="2x"/>);
    }
    return (
    <>
        <button onClick={onClick} style={{verticalAlign: "middle", color: color, border: "none", textAlign: "center", padding: "16px", cursor: "pointer", backgroundColor: "rgba(0,0,0,0)"}} hidden={!persistantArrows && !visible}>{getIcon(dir)}</button>
    </>
    )
}

export default HorizontalScrollButton