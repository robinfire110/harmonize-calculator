import React, { useEffect } from 'react'

function Title({title}) {
    useEffect(() => {
        document.title = `Harmonize Calculator - ${title}`;
    }, []);
    return (
        <>
        </>
    )
}

export default Title