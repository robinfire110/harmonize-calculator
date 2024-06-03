import React, { useEffect } from 'react'

function Title({title}) {
    useEffect(() => {
        if (title) document.title = `Harmonize Calculator - ${title}`;
        else document.title = `Harmonize Calculator`;
    }, []);
}

export default Title