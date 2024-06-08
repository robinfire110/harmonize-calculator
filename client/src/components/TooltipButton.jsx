import React from 'react';
import { OverlayTrigger, Button, Popover } from 'react-bootstrap';

function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }

//Popovers (tool tips)
function createPopover(text="") {
    return (
        <Popover id="popover-trigger-hover-focus" title="Tool Tip" style={{padding: "10px"}}><div dangerouslySetInnerHTML={{__html: text}}/></Popover>
    )
};

function TooltipButton({buttonVarient="light", text="Tool tip", activate=['hover', 'focus'], style={}}) {
    return (
        <OverlayTrigger trigger={activate} placement="top" overlay={createPopover(text)}><Button tabIndex={-1} style={style} variant={buttonVarient}>?</Button></OverlayTrigger>
    )
}

export default TooltipButton;